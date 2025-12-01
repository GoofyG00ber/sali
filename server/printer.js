import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

// KONFIGURÁCIÓ
// Fontos: A nyomtatót meg kell osztani a Windowsban "XP58" néven.
// Gépház -> Eszközök -> Nyomtatók -> XP-58 (copy 1) -> Kezelés -> Nyomtató tulajdonságai -> Megosztás -> Nyomtató megosztása -> Megosztási név: XP58
const PRINTER_SHARE_NAME_USER = 'XP58';
const PRINTER_SHARE_NAME = `\\\\localhost\\${PRINTER_SHARE_NAME_USER}`;

export async function printOrder(order) {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON, // XP58 általában ESC/POS kompatibilis
      interface: 'tcp://0.0.0.0', // Dummy interface, a buffert használjuk és manuálisan küldjük
      characterSet: CharacterSet.PC852_LATIN2, // Ékezetes karakterekhez
      removeSpecialCharacters: false,
      lineCharacter: "=",
      width: 32, // XP58 általában 58mm, kb 32 karakter fér el
      options: {
        timeout: 5000
      }
    });

    // Fejléc
    printer.alignCenter();
    printer.bold(true);
    printer.println("RENDELÉS");
    printer.bold(false);
    printer.drawLine();

    // Rendelés adatok
    printer.alignLeft();
    printer.println(`Rendelés ID:`);
    printer.println(`#${order.id}`);
    printer.println(`Dátum: ${new Date(order.createdAt).toLocaleString('hu-HU')}`);
    printer.println(`Fizetés: ${order.paymentMethod === 'barion' ? 'Online fizetés' : 'Utánvét'}`);
    printer.println(`Átvétel: ${order.deliveryType === 'delivery' ? 'Házhozszállítás' : 'Elvitel'}`);

    printer.drawLine();

    // Vevő adatok
    printer.bold(true);
    printer.println("Vevő:");
    printer.bold(false);
    printer.println(order.deliveryInfo.name);
    printer.println(order.deliveryInfo.phone);

    if (order.deliveryType === 'delivery') {
      printer.println(`${order.deliveryInfo.city}, ${order.deliveryInfo.zip}`);
      printer.println(order.deliveryInfo.address);
    }

    if (order.deliveryInfo.note) {
      printer.println("Megjegyzés:");
      printer.println(order.deliveryInfo.note);
    }

    printer.drawLine();

    // Tételek
    // Kisebb betűtípusra váltás a tételeknél (Font B)
    printer.setTypeFontA();

    printer.tableCustom([
      { text: "Termék", align: "LEFT", width: 0.60 },
      { text: "Ár", align: "RIGHT", width: 0.20 },
      { text: "Db", align: "RIGHT", width: 0.15 }
    ]);

    for (const item of order.items) {
      let title = item.foodTitle;
      if (item.priceLabel && item.priceLabel !== 'Alap') {
        title += ` (${item.priceLabel})`;
      }

      printer.tableCustom([
        { text: title, align: "LEFT", width: 0.60 },
        { text: Math.round(item.price) + "", align: "RIGHT", width: 0.20 },
        { text: item.quantity + "x", align: "RIGHT", width: 0.15 }
      ]);

      // Extrák megjelenítése
      if (item.extras && Array.isArray(item.extras) && item.extras.length > 0) {
        for (const extra of item.extras) {
          printer.tableCustom([
            { text: "  + " + extra.title, align: "LEFT", width: 0.60 },
            { text: Math.round(extra.price) + "", align: "RIGHT", width: 0.20 },
            { text: extra.quantity + "x", align: "RIGHT", width: 0.15 }
          ]);
        }
      }
    }

    // Visszaváltás normál betűtípusra (Font A)
    printer.setTypeFontA();

    printer.drawLine();

    // Összesen
    printer.alignRight();
    printer.bold(true);
    printer.println("Összesen:");
    printer.setTextSize(1, 1);
    printer.println(`${Math.round(order.totalPrice)} Ft`);
    printer.setTextSize(0, 0);
    printer.bold(false);

    printer.cut();

    // Buffer generálása és küldése a nyomtatónak
    const buffer = printer.getBuffer();

    // Ideiglenes fájlba írás
    const tempFile = path.join(os.tmpdir(), `order-${order.id}-${Date.now()}.bin`);
    fs.writeFileSync(tempFile, buffer);

    console.log(`Nyomtatás küldése: ${PRINTER_SHARE_NAME} (File: ${tempFile})`);

    // Windows 'print' parancs használata a megosztott nyomtatóhoz
    // VAGY 'copy /b file \\computer\printer'
    // A Powershell Copy-Item is működhet, de a cmd copy /b a legbiztosabb bináris másoláshoz

    const command = `cmd /c copy /b "${tempFile}" "${PRINTER_SHARE_NAME}"`;

    exec(command, (error) => {
      if (error) {
        console.error(`Hiba a nyomtatásnál: ${error.message}`);
        console.error(`Győződj meg róla, hogy a nyomtató meg van osztva "${PRINTER_SHARE_NAME_USER}" néven!`);
      } else {
        console.log('Nyomtatási parancs elküldve.');
      }

      // Takarítás
      setTimeout(() => {
        try { fs.unlinkSync(tempFile); } catch {}
      }, 1000);
    });

  } catch (error) {
    console.error('Nyomtatási hiba:', error);
  }
}
