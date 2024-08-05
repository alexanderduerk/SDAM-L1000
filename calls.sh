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


curl -X PATCH --header "Content-Type: application/json" \
  --data '{
  "pert_id": "