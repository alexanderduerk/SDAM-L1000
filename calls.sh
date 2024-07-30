#!/bin/bash

# GET request to check server status
curl http://localhost:3000

# POST request with JSON payload
curl -X POST --header "Content-Type: application/json" \
  --data '{"cell_iname": "CellA", "pert_id": "Pert123", "gene_symbol": "GeneX", "ss_ngene": 10}' \
  http://localhost:3000/mainviews
