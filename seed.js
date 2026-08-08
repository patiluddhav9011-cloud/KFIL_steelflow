/**
 * Seed Script
 * ------------
 * Wipes and repopulates the database with realistic sample data so you have
 * something to look at immediately, without needing real plant data.
 *
 * Run with: npm run seed   (from inside the backend folder)
 */

import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";

import Order from "./models/Order.js";
import Inventory from "./models/Inventory.js";
import Supplier from "./models/Supplier.js";
import Shipment from "./models/Shipment.js";

dotenv.config();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function seed() {
  await connectDB();

  console.log("[KFILSteelFlow] Clearing existing data...");
  await Promise.all([
    Order.deleteMany({}),
    Inventory.deleteMany({}),
    Supplier.deleteMany({}),
    Shipment.deleteMany({})
  ]);

  console.log("[KFILSteelFlow] Seeding orders...");
  const products = ["TMT Rebar", "HR Coil", "CR Coil", "Wire Rod", "Billet"];
  const customers = [
    "L&T Constructions", "Tata Projects", "Bharat Infra Co.", "Ashoka Buildcon", "Reliance Metals",
    "Adani Realty", "Shapoorji Pallonji", "NCC Limited", "GMR Infrastructure", "JSW Infra"
  ];
  const destinations = [
    "Chennai Port", "Hubli Distribution Hub", "Mumbai JNPT", "Bengaluru Yard", "Hyderabad Depot",
    "Kolkata Dock", "Pune Warehouse", "Delhi NCR Hub", "Ahmedabad Yard", "Vizag Port"
  ];
  const statuses = ["delivered", "delivered", "delivered", "confirmed", "in_transit", "delayed"];

  const orders = [];
  // Generate ~20 months of order history (5 products x 10 orders/month x 20 months = 1000 rows)
  // so there's plenty of data for trend/seasonality forecasting.
  const MONTHS_BACK = 20;
  const ORDERS_PER_PRODUCT_PER_MONTH = 10;

  for (let monthBack = MONTHS_BACK - 1; monthBack >= 0; monthBack--) {
    products.forEach((product, pIdx) => {
      const baseQty = 800 + pIdx * 150;
      const growth = (MONTHS_BACK - 1 - monthBack) * 15; // gentle upward trend over time
      // simple seasonal bump for a couple of months in the cycle
      const seasonal = [2, 3].includes(monthBack % 12) ? 120 : 0;

      for (let o = 0; o < ORDERS_PER_PRODUCT_PER_MONTH; o++) {
        const noise = Math.round(Math.random() * 100 - 50);
        const custIdx = (pIdx + o) % customers.length;
        const destIdx = (pIdx + o) % destinations.length;
        const isCurrentMonth = monthBack === 0;
        const status = isCurrentMonth
          ? (o % 2 === 0 ? "confirmed" : "in_transit")
          : statuses[Math.floor(Math.random() * statuses.length)];

        orders.push({
          orderId: `ORD-${product.replace(/\s/g, "").slice(0, 3).toUpperCase()}-${monthBack}-${pIdx}-${o}`,
          customerName: customers[custIdx],
          product,
          quantityMT: Math.max(100, Math.round((baseQty + growth + seasonal + noise) / ORDERS_PER_PRODUCT_PER_MONTH * 2)),
          orderDate: daysAgo(monthBack * 30 + Math.floor(Math.random() * 28)),
          requiredByDate: daysFromNow(15 - monthBack * 2 + o),
          destination: destinations[destIdx],
          status,
          priority: pIdx === 0 || o % 5 === 0 ? "high" : "normal"
        });
      }
    });
  }
  await Order.insertMany(orders);
  console.log(`[KFILSteelFlow] Inserted ${orders.length} orders.`);

  console.log("[KFILSteelFlow] Seeding inventory...");
  await Inventory.insertMany([
    { itemName: "Iron Ore (Fines)", category: "raw_material", unit: "MT", currentStock: 42500, avgDailyConsumption: 1400, demandStdDev: 180, leadTimeDays: 14 },
    { itemName: "Coking Coal", category: "raw_material", unit: "MT", currentStock: 8600, avgDailyConsumption: 950, demandStdDev: 140, leadTimeDays: 30 },
    { itemName: "Steel Scrap (HMS)", category: "raw_material", unit: "MT", currentStock: 15200, avgDailyConsumption: 620, demandStdDev: 90, leadTimeDays: 10 },
    { itemName: "Limestone / Dolomite", category: "raw_material", unit: "MT", currentStock: 9100, avgDailyConsumption: 340, demandStdDev: 40, leadTimeDays: 7 },
    { itemName: "Ferro Alloys", category: "raw_material", unit: "MT", currentStock: 640, avgDailyConsumption: 48, demandStdDev: 12, leadTimeDays: 21 },
    { itemName: "TMT Rebar", category: "finished_good", unit: "MT", currentStock: 6200, avgDailyConsumption: 700, demandStdDev: 110, leadTimeDays: 3 },
    { itemName: "HR Coil", category: "finished_good", unit: "MT", currentStock: 3100, avgDailyConsumption: 480, demandStdDev: 95, leadTimeDays: 3 },
    { itemName: "CR Coil", category: "finished_good", unit: "MT", currentStock: 2400, avgDailyConsumption: 230, demandStdDev: 55, leadTimeDays: 4 },
    { itemName: "Wire Rod", category: "finished_good", unit: "MT", currentStock: 1150, avgDailyConsumption: 210, demandStdDev: 60, leadTimeDays: 4 }
  ]);

  console.log("[KFILSteelFlow] Seeding suppliers...");
  await Supplier.insertMany([
    { name: "Anglo Ore Traders", category: "Iron Ore", location: "Odisha, IN", contactEmail: "contact@angloore.example", onTimeDeliveryRate: 81, qualityAcceptanceRate: 92, financialHealthScore: 70, geopoliticalStabilityScore: 75, singleSourceDependency: true, pastLeadTimesDays: [13, 15, 12, 18, 16, 14] },
    { name: "BlueSeam Coking Coal Co.", category: "Coking Coal", location: "Australia", contactEmail: "sales@blueseam.example", onTimeDeliveryRate: 89, qualityAcceptanceRate: 96, financialHealthScore: 85, geopoliticalStabilityScore: 90, singleSourceDependency: false, pastLeadTimesDays: [28, 31, 29, 33, 30] },
    { name: "Deccan Scrap Metals", category: "Scrap", location: "Karnataka, IN", contactEmail: "orders@deccanscrap.example", onTimeDeliveryRate: 97, qualityAcceptanceRate: 90, financialHealthScore: 78, geopoliticalStabilityScore: 95, singleSourceDependency: false, pastLeadTimesDays: [9, 10, 8, 11, 9, 10] },
    { name: "Meridian Alloys Ltd.", category: "Ferro Alloys", location: "South Africa", contactEmail: "info@meridianalloys.example", onTimeDeliveryRate: 84, qualityAcceptanceRate: 93, financialHealthScore: 65, geopoliticalStabilityScore: 60, singleSourceDependency: true, pastLeadTimesDays: [19, 22, 25, 20, 23] },
    { name: "Konkan Limestone Works", category: "Limestone", location: "Maharashtra, IN", contactEmail: "sales@konkanlime.example", onTimeDeliveryRate: 99, qualityAcceptanceRate: 98, financialHealthScore: 88, geopoliticalStabilityScore: 96, singleSourceDependency: false, pastLeadTimesDays: [6, 7, 6, 8, 7] }
  ]);

  console.log("[KFILSteelFlow] Seeding shipments...");
  await Shipment.insertMany([
    { shipmentId: "RT-401", mode: "rail", origin: "Koppal Plant", destination: "Chennai Port", distanceKm: 620, standardCostInr: 285000, standardHours: 26, routeStatus: "pending" },
    { shipmentId: "RT-402", mode: "road", origin: "Koppal Plant", destination: "Hubli Distribution Hub", distanceKm: 145, standardCostInr: 94000, standardHours: 5, routeStatus: "pending" },
    { shipmentId: "RT-403", mode: "rail", origin: "Koppal Plant", destination: "Mumbai JNPT", distanceKm: 700, standardCostInr: 320000, standardHours: 30, routeStatus: "pending" },
    { shipmentId: "RT-404", mode: "road", origin: "Koppal Plant", destination: "Bengaluru Yard", distanceKm: 260, standardCostInr: 72000, standardHours: 4, routeStatus: "pending" }
  ]);

  console.log("[KFILSteelFlow] Done! Sample data loaded.");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[KFILSteelFlow] Seed failed:", err);
  process.exit(1);
});
