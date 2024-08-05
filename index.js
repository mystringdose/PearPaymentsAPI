const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// AWS DynamoDB configuration
AWS.config.update({
  region: 'us-east-1',  
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// DynamoDB table names
const TRANSACTION_TABLE = 'Transactions';
const ACTIVITY_LOGS_TABLE = 'ActivityLogs';

// Endpoint to receive and store transaction payload
app.post('/transactions', async (req, res) => {
  const transaction = req.body;

  // Generate a unique transaction ID
  transaction['transaction-id'] = uuidv4();

  const params = {
    TableName: TRANSACTION_TABLE,
    Item: transaction
  };

  try {
    await dynamodb.put(params).promise();
    res.status(201).json({ message: 'Transaction stored successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to store transaction', error });
  }
});

// Endpoint to view transaction listings
app.get('/transactions', async (req, res) => {
  const params = {
    TableName: TRANSACTION_TABLE
  };

  try {
    const data = await dynamodb.scan(params).promise();
    res.status(200).json(data.Items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
});

// Endpoint to view activity logs
app.get('/activitylogs', async (req, res) => {
  const params = {
    TableName: ACTIVITY_LOGS_TABLE
  };

  try {
    const data = await dynamodb.scan(params).promise();
    res.status(200).json(data.Items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity logs', error });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
