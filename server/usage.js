const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const METRONOME_API_BASE = 'https://api.metronome.com/v1';
const METRONOME_API_BEARER_TOKEN = process.env.METRONOME_API_BEARER_TOKEN;

const metronomeApi = axios.create({
  baseURL: METRONOME_API_BASE,
  headers: {
    Authorization: `Bearer ${METRONOME_API_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Get billable metrics for a customer
router.get('/billable-metrics', async (req, res) => {
  const { customer_id } = req.query;
  if (!customer_id) return res.status(400).json({ error: 'customer_id required' });
  try {
    const response = await metronomeApi.get(`/customers/${customer_id}/billable-metrics`);
    res.json({ billableMetrics: response.data.data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch billable metrics' });
  }
});

// Get usage for a billable metric
router.post('/usage', async (req, res) => {
  const { customer_id, billable_metric_id, starting_on, ending_before, window_size, group_by } = req.body;
  if (!customer_id || !billable_metric_id || !starting_on || !ending_before || !window_size || !group_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const response = await metronomeApi.post(`/usage`, {
      customer_id,
      billable_metric_id,
      starting_on,
      ending_before,
      window_size,
      group_by,
    });
    // console.log('Metronome /usage response:', JSON.stringify(response.data, null, 2));
    res.json({ usage: response.data.data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

module.exports = router;
