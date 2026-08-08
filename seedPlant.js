/**
 * seedPlant.js
 * Seeds realistic demo data for the Jejuri Plant Operations Dashboard.
 *
 * Run with:  node seedPlant.js
 * (or)       npm run seed-plant
 *
 * This script re-uses the SAME MongoDB connection string your main
 * app already uses. It does NOT touch your existing Inventory, Order,
 * Shipment, or Supplier collections.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Production = require('./models/Production');
const PlantInventory = require('./models/PlantInventory');
const Dispatch = require('./models/Dispatch');
const Alert = require('./models/Alert');

const PLANT_NAME = 'Jejuri Plant';

// Use the same env var your existing server.js uses to connect to Atlas.
// Falls back to a local URI only if nothing is set.
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  'mongodb://localhost:27017/steel_scm';

async function seedPlant() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Jejuri Plant seeding...');

    // Clear only Jejuri Plant data so re-running this script is safe
    await Promise.all([
      Production.deleteMany({ plantName: PLANT_NAME }),
      PlantInventory.deleteMany({ plantName: PLANT_NAME }),
      Dispatch.deleteMany({ plantName: PLANT_NAME }),
      Alert.deleteMany({ plantName: PLANT_NAME }),
    ]);
    console.log('Cleared existing Jejuri Plant records.');

    // ---- Production ----
    const production = await Production.create({
      plantName: PLANT_NAME,
      date: new Date(),
      targetProduction: 1200, // MT
      actualProduction: 1085, // MT
      efficiency: 90,
      machineUtilization: 87,
      status: 'On Track',
    });

    // ---- Plant Inventory ----
    const inventory = await PlantInventory.create({
      plantName: PLANT_NAME,
      rawMaterialStock: 850, // MT of billets
      finishedGoods: 620, // MT
      reorderLevel: 900, // MT threshold
      criticalItems: 2,
      status: 'Low Stock',
    });

    // ---- Dispatch ----
    const dispatch = await Dispatch.create({
      plantName: PLANT_NAME,
      date: new Date(),
      plannedDispatch: 18, // trucks
      completedDispatch: 15,
      pendingDispatch: 3,
      vehiclesRunning: 3,
      status: 'On Schedule',
    });

    // ---- Alerts ----
    const alerts = await Alert.insertMany([
      {
        plantName: PLANT_NAME,
        severity: 'Critical',
        message: 'Billet stock has dropped below the safe reorder threshold.',
        timestamp: new Date(),
        resolved: false,
      },
      {
        plantName: PLANT_NAME,
        severity: 'Warning',
        message: 'Truck dispatch #JP-114 delayed due to loading bay congestion.',
        timestamp: new Date(),
        resolved: false,
      },
      {
        plantName: PLANT_NAME,
        severity: 'Info',
        message: 'Rolling Mill scheduled maintenance planned for this weekend.',
        timestamp: new Date(),
        resolved: false,
      },
    ]);

    console.log('Jejuri Plant demo data seeded successfully:');
    console.log({
      production: production.toObject(),
      inventory: inventory.toObject(),
      dispatch: dispatch.toObject(),
      alertsInserted: alerts.length,
    });

    process.exit(0);
  } catch (err) {
    console.error('Error seeding Jejuri Plant data:', err);
    process.exit(1);
  }
}

seedPlant();
