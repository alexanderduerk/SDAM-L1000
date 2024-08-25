# !/bin/bash


# Cells Post request with JSON payload
curl -X POST --header "Content-Type: application/json" \
  --data '{
    "cell_name": "Pert123",  
    "cellosaurus_id": "CS001",  
    "donor_age": 35,
    "doubling_time": "24h", 
    "growth_medium": "DMEM",  
    "cell_type": "tumor", 
    "donor_ethnicity": "Caucasian",  
    "donor_sex": "M",  
    "donor_tumor_phase": "stage_3",  
    "cell_lineage": "epithelial",  
    "primary_disease": "breast_cancer",  
    "subtype_disease": "adenocarcinoma",  
    "provider_name": "LabX",  
    "growth_pattern": "adherent" 
  }' \
  http://localhost:3000/cells



# Cell PATCH request with JSON payload
curl -X PATCH --header "Content-Type: application/json" \
  --data '{
  "cell_name": "Pert123",  
    "cellosaurus_id": "CS001",  
    "donor_age": 35,
    "doubling_time": "24h", 
    "growth_medium": "DMEM",  
    "cell_type": "tumor", 
    "donor_ethnicity": "Caucasian",  
    "donor_sex": "M",  
    "donor_tumor_phase": "stage_3",  
    "cell_lineage": "epithelial",  
    "primary_disease": "breast_cancer",  
    "subtype_disease": "adenocarcinoma",  
    "provider_name": "LabX",  
    "growth_pattern": "adherent" 
  }' \
  http://localhost:3000/cells
 

# Cell GET request with JSON payload
curl -X GET http://localhost:3000/cells?/27




# Pertubagens DELETION request with JSON payload
curl -X DELETE --header "Content-Type: application/json" \
  --data '{
    "cell_name": "Pert123",  
    "cellosaurus_id": "CS001",  
    "donor_age": 35,
    "doubling_time": "24h", 
    "growth_medium": "DMEM",  
    "cell_type": "tumor", 
    "donor_ethnicity": "Caucasian",  
    "donor_sex": "M",  
    "donor_tumor_phase": "stage_3",  
    "cell_lineage": "epithelial",  
    "primary_disease": "breast_cancer",  
    "subtype_disease": "adenocarcinoma",  
    "provider_name": "LabX",  
    "growth_pattern": "adherent"  
    }' \
  http://localhost:3000/cells

# Cells SEARCH request with JSON payload
apiURL="http://localhost:3000/cells/search?field=cell_name&op==&val=Pert123"
response=$(curl -s "$apiURL")
# Extract pert_name using jq or other methods
cell_name=$(echo "$response" | jq -r '[0].cell_name')
echo "Cell Name: $cell_name"



