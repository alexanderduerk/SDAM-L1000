#!/bin/bash

# Define the base URL for your API
base_url="http://localhost:3000/genes"

# Step 1: Create a new entry using POST
# echo "Creating a new gene entry..."
create_response=$(curl -s -X POST "$base_url" \
  -H "Content-Type: application/json" \
  -d '{
  "entrez_id":777777,
  "gene_symbol":"TEST1",
  "ensembl_id":"TEST2",
  "gene_title":"TEST3",
  "gene_type":"TEST4",
  "src":"TEST5",
  "feature_space":"TEST6"
}')

echo "Successfully created Gene: $create_response"

# Step 2: Search the created entry to get its ID
# Define the URL of the server route
url="http://localhost:3000/genes/search"

# Use this JSON object in the curl request
response=$(curl -s -X POST "$url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "asc",
      "descendants": false,
      "field": "gene_symbol",
      "op": "contains",
      "val": "TEST1",
      "orderfield": "gene_symbol"
  }}')

echo "Sucessfully searched for the created Gene: $response"

# Extract the ID from the search response
gene_id=$(echo "$response" | jq -r '.[0].gene_id')

# echo "Updating the entry with ID: $gene_id..."
curl -s -X PATCH "$base_url" \
  -H "Content-Type: application/json" \
  -d '{
  "geneid": "'$gene_id'",
  "columnname": "feature_space",
  "newvalue": "UPDATED"
  }'

url="http://localhost:3000/genes/search"

# Use this JSON object in the curl request
updated_entry=$(curl -s -X POST "$url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "asc",
      "descendants": false,
      "field": "gene_symbol",
      "op": "contains",
      "val": "TEST1",
      "orderfield": "gene_symbol"
  }}')

echo "Successfully updated Geneentry: $updated_entry"

  # Complex Search test
  url="http://localhost:3000/genes/search"

  # Use this JSON object in the curl request
  updated_complex=$(curl -s -X POST "$url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "field": "",
      "op": "AND",
      "val": "",
      "orderfield": "gene_symbol",
      "descendants": [
          {
            "op": "contains",
            "val": "H",
            "field": "gene_symbol"},
          {
            "op": "contains",
            "val": "histone",
            "field": "gene_title"}]
  }}')

echo "Sucessfully searched with descendants: $updated_complex"

deleted_entry=$(curl -s -X DELETE "$base_url/$gene_id")
echo "Sucessfully deleted: $deleted_entry"


# Define the base URL for your API
cells_url="http://localhost:3000/cells"

# Step 1: Create a new entry using POST
# echo "Creating a new Cell entry..."
create_cellresponse=$(curl -s -X POST "$cells_url" \
  -H "Content-Type: application/json" \
  -d '{
  "cell_name":"CELL1",
  "cellosaurus_id":"TESTID",
  "donor_age":10,
  "doubling_time":"10h",
  "growth_medium":"TESTMEDIUM",
  "cell_type":"TESTTYPE",
  "donor_ethnicity":"CAUCASIAN",
  "donor_sex":"M",
  "donor_tumor_phase":"S4",
  "cell_lineage":"TESTLINEAGE",
  "primary_disease":"TESTDISEASE",
  "subtype_disease":"TESTSUBTYPE",
  "provider_name":"TESTPROVIDER",
  "growth_pattern":"TESTPATTERN"
}')

echo "Successfully created Cell: $create_cellresponse"

# Step 2: Search the created entry to get its ID
# Define the URL of the server route
cells_url="http://localhost:3000/cells/search"

# Use this JSON object in the curl request
cellresponse=$(curl -s -X POST "$cells_url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "descendants": false,
      "field": "cell_name",
      "op": "contains",
      "val": "CELL1",
      "orderfield": "cell_name"
  }}')

echo "Sucessfully searched for the created Cell: $cellresponse"

# Extract the ID from the search response
cell_id=$(echo "$cellresponse" | jq -r '.[0].cell_id')

# echo "Updating the entry with ID: $cell_id..."
curl -s -X PATCH "$cells_url" \
  -H "Content-Type: application/json" \
  -d '{
  "cellId": "'$cell_id'",
  "columnname": "cell_name",
  "newvalue": "UPDATED"
  }'

cells_url="http://localhost:3000/cells/search"

# Use this JSON object in the curl request
updated_entry=$(curl -s -X POST "$cells_url" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "asc",
      "descendants": false,
      "field": "cell_name",
      "op": "contains",
      "val": "UPDATED",
      "orderfield": "cell_name"
  }}')

echo "Successfully updated Geneentry: $updated_entry"

  # Complex Search test
  cells_url="http://localhost:3000/genes/search"

  # Use this JSON object in the curl request
  updated_cellcomplex=$(curl -s -X POST "$cells_url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"searchArg": {
      "limit": 10,
      "offset": 0,
      "order": "ASC",
      "field": "",
      "op": "AND",
      "val": "",
      "orderfield": "cell_name",
      "descendants": [
          {
            "op": "contains",
            "val": "U",
            "field": "cell_name"},
          {
            "op": "contains",
            "val": "T",
            "field": "growth_pattern"}]
  }}')

echo "Sucessfully searched with descendants: $updated_cellcomplex"

deleted_cellentry=$(curl -s -X DELETE "$cells_url/$cell_id")
echo "Sucessfully deleted: $deleted_cellentry"


