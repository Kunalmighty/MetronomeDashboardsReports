require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;
const usageRouter = require('./usage');
const invoiceRouter = require('./invoice');

app.use(cors());
app.use(express.json());
app.use('/api/usage', usageRouter);
app.use('/api/invoice', invoiceRouter);

const METRONOME_API_BASE = 'https://api.metronome.com/v1';
const METRONOME_API_BEARER_TOKEN = process.env.METRONOME_API_BEARER_TOKEN;

// Helper for Metronome API requests
const metronomeApi = axios.create({
  baseURL: METRONOME_API_BASE,
  headers: {
    Authorization: `Bearer ${METRONOME_API_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Fetch customer IDs
app.get('/api/customers', async (req, res) => {
  try {
    const response = await metronomeApi.get('/customers');
    // console.log('Metronome /customers API response:', response.data); // DEBUG
    const customers = response.data.data || [];
    // Return both id and name for each customer
    const customerList = customers.map(c => ({ id: c.id, name: c.name }));
    res.json({ customers: customerList });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer IDs' });
  }
});

// Fetch dashboard URLs
app.get('/api/dashboard-urls', async (req, res) => {
  const { customer_id, dashboard_type } = req.query;
  if (!customer_id || !dashboard_type) {
    return res.status(400).json({ error: 'customer_id and dashboard_type required' });
  }
  // This is a placeholder. Replace with the actual endpoint and logic for dashboard URLs.
  try {
    // Send POST request with body for embeddable URL
    // Debug log outgoing request
    // console.log('Requesting embeddable URL for:', { customer_id, dashboard_type });
    const response = await metronomeApi.post(
      `/dashboards/getEmbeddableUrl`,
      {
        customer_id: customer_id,
        dashboard: dashboard_type,
      }
    );
    // console.log('Metronome /dashboards/getEmbeddableUrl response:', response.data);
    res.json({ url: response.data.data.url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard URL' });
  }
});

app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});
