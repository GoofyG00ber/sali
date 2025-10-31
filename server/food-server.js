import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const MENU_FILE = path.join(__dirname, '../public/routes/menu.json');
const POLICIES_FILE = path.join(__dirname, '../public/data/policies.json');
const ORDERS_FILE = path.join(__dirname, '../public/data/orders.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read menu data
async function readMenuData() {
  try {
    const data = await fs.readFile(MENU_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading menu file:', error);
    throw error;
  }
}

// Helper function to write menu data
async function writeMenuData(data) {
  try {
    await fs.writeFile(MENU_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing menu file:', error);
    throw error;
  }
}

// GET all categories and items
app.get('/api/menu', async (req, res) => {
  try {
    const menuData = await readMenuData();
    res.json(menuData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu data' });
  }
});

// GET all food items (flattened)
app.get('/api/foods', async (req, res) => {
  try {
    const menuData = await readMenuData();
    const allFoods = [];

    menuData.categories.forEach(category => {
      category.items.forEach(item => {
        allFoods.push({
          ...item,
          categoryId: category.id,
          categoryTitle: category.title
        });
      });
    });

    res.json(allFoods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

// GET single food item
app.get('/api/foods/:id', async (req, res) => {
  try {
    const menuData = await readMenuData();
    const foodId = parseInt(req.params.id);

    for (const category of menuData.categories) {
      const food = category.items.find(item => item.id === foodId);
      if (food) {
        res.json({
          ...food,
          categoryId: category.id,
          categoryTitle: category.title
        });
        return;
      }
    }

    res.status(404).json({ error: 'Food item not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch food item' });
  }
});

// POST create new food item
app.post('/api/foods', async (req, res) => {
  try {
    const menuData = await readMenuData();
    const { categoryId, ...foodData } = req.body;

    const category = menuData.categories.find(c => c.id === categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Generate new ID
    let maxId = 0;
    menuData.categories.forEach(cat => {
      cat.items.forEach(item => {
        if (item.id > maxId) maxId = item.id;
      });
    });

    const newFood = {
      id: maxId + 1,
      ...foodData,
      active: foodData.active !== undefined ? foodData.active : true
    };

    category.items.push(newFood);
    await writeMenuData(menuData);

    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create food item' });
  }
});

// PUT update food item
app.put('/api/foods/:id', async (req, res) => {
  try {
    const menuData = await readMenuData();
    const foodId = parseInt(req.params.id);
    const { categoryId, ...updateData } = req.body;

    // Find the food item
    let foundCategory = null;
    let foundItemIndex = -1;

    for (const category of menuData.categories) {
      const itemIndex = category.items.findIndex(item => item.id === foodId);
      if (itemIndex !== -1) {
        foundCategory = category;
        foundItemIndex = itemIndex;
        break;
      }
    }

    if (!foundCategory) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    // If category changed, move the item
    if (categoryId && categoryId !== foundCategory.id) {
      const newCategory = menuData.categories.find(c => c.id === categoryId);
      if (!newCategory) {
        return res.status(404).json({ error: 'New category not found' });
      }

      const [item] = foundCategory.items.splice(foundItemIndex, 1);
      const updatedItem = { ...item, ...updateData, id: foodId };
      newCategory.items.push(updatedItem);

      await writeMenuData(menuData);
      res.json(updatedItem);
    } else {
      // Update in place
      foundCategory.items[foundItemIndex] = {
        ...foundCategory.items[foundItemIndex],
        ...updateData,
        id: foodId
      };

      await writeMenuData(menuData);
      res.json(foundCategory.items[foundItemIndex]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update food item' });
  }
});

// DELETE food item
app.delete('/api/foods/:id', async (req, res) => {
  try {
    const menuData = await readMenuData();
    const foodId = parseInt(req.params.id);

    for (const category of menuData.categories) {
      const itemIndex = category.items.findIndex(item => item.id === foodId);
      if (itemIndex !== -1) {
        category.items.splice(itemIndex, 1);
        await writeMenuData(menuData);
        res.json({ message: 'Food item deleted successfully' });
        return;
      }
    }

    res.status(404).json({ error: 'Food item not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

// PATCH toggle active status
app.patch('/api/foods/:id/toggle-active', async (req, res) => {
  try {
    const menuData = await readMenuData();
    const foodId = parseInt(req.params.id);

    for (const category of menuData.categories) {
      const item = category.items.find(item => item.id === foodId);
      if (item) {
        item.active = !item.active;
        await writeMenuData(menuData);
        res.json(item);
        return;
      }
    }

    res.status(404).json({ error: 'Food item not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle food status' });
  }
});

// GET all categories
app.get('/api/categories', async (req, res) => {
  try {
    const menuData = await readMenuData();
    res.json(menuData.categories.map(cat => ({
      id: cat.id,
      title: cat.title,
      image: cat.image
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ============= POLICIES ENDPOINTS =============

// GET all policies
app.get('/api/policies', async (req, res) => {
  try {
    const data = await fs.readFile(POLICIES_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

// GET specific policy (aszf or privacy)
app.get('/api/policies/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const data = await fs.readFile(POLICIES_FILE, 'utf-8');
    const policies = JSON.parse(data);

    if (!policies[type]) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policies[type]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

// PUT update policy
app.put('/api/policies/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { content } = req.body;

    const data = await fs.readFile(POLICIES_FILE, 'utf-8');
    const policies = JSON.parse(data);

    if (!policies[type]) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    policies[type].content = content;
    policies[type].lastUpdated = new Date().toISOString();

    await fs.writeFile(POLICIES_FILE, JSON.stringify(policies, null, 2), 'utf-8');
    res.json(policies[type]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

// ============= ORDERS ENDPOINTS =============

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const ordersData = JSON.parse(data);
    res.json(ordersData.orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const ordersData = JSON.parse(data);

    const order = ordersData.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST create new order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const ordersData = JSON.parse(data);

    const newOrder = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ordersData.orders.push(newOrder);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(ordersData, null, 2), 'utf-8');

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH update order status
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, paymentStatus } = req.body;
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const ordersData = JSON.parse(data);

    const orderIndex = ordersData.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status) ordersData.orders[orderIndex].status = status;
    if (paymentStatus) ordersData.orders[orderIndex].paymentStatus = paymentStatus;
    ordersData.orders[orderIndex].updatedAt = new Date().toISOString();

    await fs.writeFile(ORDERS_FILE, JSON.stringify(ordersData, null, 2), 'utf-8');
    res.json(ordersData.orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.listen(PORT, () => {
  console.log(`Food API server running on http://localhost:${PORT}`);
});
