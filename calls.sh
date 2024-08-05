#!/bin/bash

#Pertubagens POST request with JSON payload
curl -X POST --header "Content-Type: application/json" \
  --data '{
    "pert_name": "Pert123",
    "cmap_name": "Pert123",
    "gene_target": "GeneX",
    "moa": "Mechanism1",
    "canonical_smiles": "C1=CC=CC=C1",
    "inchi_key": "InChIKey1",
    "compound_aliases": "Alias1"
  }' \
  http://localhost:3000/pertubations



# Pertubagens PATCH request with JSON payload
curl -X PATCH --header "Content-Type: application/json" \
  --data '{
    "pertid": 1,
    "column": "gene_target",
    "newvalue": "GeneY"
  }' \
  http://localhost:3000/pertubations



# Pertubagens SEARCH request with JSON payload
curl -X PATCH --header "Content-Type: application/json" \
  --data '{
    "pertid": 1,
    "column": "gene_target",
    "newvalue": "GeneY"
  }' \
  http://localhost:3000/pertubations

# Pertubagens DELETION request with JSON payload
