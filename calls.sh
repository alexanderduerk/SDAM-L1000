#!/bin/bash

# GET request to check server status
curl http://localhost:3000

# POST request with JSON payload
curl -X POST --header "Content-Type: application/json" \
  --data '{"cell_iname": "CellA", "pert_id": "Pert123", "gene_symbol": "GeneX", "ss_ngene": 10}' \
  http://localhost:3000/mainviews

#Pertubagens POST request with JSON payload

check_server_status() {
  curl http://localhost:3000
}

# Function to create a new perturbagen
curl -X POST --header "Content-Type: application/json" \
  --data '{
    "pert_id": "Pert123",
    "cmap_name": "Pert123",
    "gene_target": "GeneX",
    "moa": "Mechanism1",
    "canonical_smiles": "C1=CC=CC=C1",
    "inchi_key": "InChIKey1",
    "compound_aliases": "Alias1"
  }' \
  http://localhost:3000/pertubations


# Function to update an existing perturbagen
#  curl -X POST --header "Content-Type: application/json" \
#    --data '{
#      "pert_id": "Pert123",
#      "column": "moa",
#      "newvalue": "NewMechanism"
#    }' \
#    http://localhost:3000/update
#

# Function to delete an existing perturbagen
#  curl -X POST --header "Content-Type: application/json" \
#    --data '{
#      "pert_id": "Pert123",
#      "column": "moa",
#      "newvalue": "NewMechanism"
#    }' \
#    http://localhost:3000/delete
#

# Function to Patch an existing pertubagen 
curl -X PATCH --header "Content-Type: application/json" \
  --data '{
       "pert_id": "Pert123",
       "column": "moa",
       "newvalue": "NewMechanism"
     }' \\
  http://localhost:3000/perturbagens



# Get Route for pertubations
if [-z "$1"]; then 
  echo "Usage: $0 <pert_id>"
  exit 1
fi 
## Set the pert_id from the first argument
PERT_ID=$1
##Make the GET request to the server
curl -X GET "http://localhost:3000/perturbagens/$PERT_ID" -H "Content-Type: application/json"
