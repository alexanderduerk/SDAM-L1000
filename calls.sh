#!/bin/bash

echo "Start"
# Start the Node.js application in the background
node app.js &

# Capture the PID of the Node.js process
NODE_PID=$!

# Give the server a moment to start
sleep 5

# Define the API endpoint and data
API_URL="http://localhost:3000/cells"
DATA='{
  "cell_iname": "MCF7",
  "cellosaurusId": "CVCL_0031",
  "donorAge": 70,
  "donorAgeDeath": 72,
  "donorDiseaseAgeOnset": 67,
  "doublingTime": 72,
  "growthMedium": "EMEM; 10% FBS ;.01mg/ml Bovine Insulin",
  "providerCatalogId": "XYZ123",
  "featureId": "c-438",
  "cellType": "tumor",
  "donorEthnicity": "Caucasian",
  "donorSex": "F",
  "donorTumorPhase": "Metastatic",
  "cellLineage": "breast",
  "primaryDisease": "breast cancer",
  "subtype": "adenocarcinoma",
  "providerName": "ATCC",
  "growthPattern": "adherent",
  "ccleName": "MCF7_BREAST",
  "cellAlias": "IBMF-7"
}'

# Make a POST request to create a new cell record
response=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "$DATA")

# Output the response
echo "Response from POST /cells:"
echo "$response"

# Kill the Node.js process
kill $NODE_PID
