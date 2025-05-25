const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/invoice/breakdown
router.post('/breakdown', async (req, res) => {
  const { customer_id, starting_on, ending_before } = req.body;
  if (!customer_id) {
    return res.status(400).json({ error: 'Missing customer_id' });
  }

  try {
    // Build the correct URL
    let url = `https://api.metronome.com/v1/customers/${customer_id}/invoices/breakdowns`;
    // Hardcode query parameters for May 2025
    const params = {
      starting_on: '2025-05-01T12:00:00+00:00',
      ending_before: '2025-05-31T12:00:00+00:00'
    };
    const metronomeRes = await axios.get(url, {
      params,
      headers: {
        Authorization: `Bearer ${process.env.METRONOME_API_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // Log the full response from the invoice breakdown endpoint
    console.log('Metronome invoice breakdown response:', JSON.stringify(metronomeRes.data, null, 2));
    const data = metronomeRes.data.data;
    const processed_data = {};
    for (const item of data) {
      const date = item['breakdown_start_timestamp'];
      for (const line_item of item['line_items'] || []) {
        const region = line_item.presentation_group_values?.region || 'Unknown';
        const value = (line_item.total || 0) / 100;
        if (!processed_data[date]) processed_data[date] = {};
        if (!processed_data[date][region]) processed_data[date][region] = 0;
        processed_data[date][region] += value;
      }
    }
    const regions = Array.from(
      new Set(
        Object.values(processed_data).flatMap(dateData => Object.keys(dateData))
      )
    ).sort();
    const chart_data = Object.keys(processed_data)
      .sort()
      .map(date => {
        const data_point = { date };
        for (const region of regions) {
          data_point[region] = processed_data[date][region] || 0;
        }
        return data_point;
      });
    res.json({ chart_data, regions });
  } catch (err) {
    // console.error('Error fetching invoice breakdown:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch invoice breakdown' });
  }
});

module.exports = router;
