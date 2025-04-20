import pandas as pd
import json

# Load the Excel sheet
df_plant = pd.read_excel(
    './egrid_historical_files_1996-2016/egrid2023_data_cleaned.xlsx',
    sheet_name='Sheet1'
)

# Strip column names of extra spaces
df_plant.columns = df_plant.columns.str.strip()

# H100 energy usage per year (MWh)
h100_mwh_per_year = 6.131

# Calculate annual emissions for 1 H100 GPU
df_plant['H100 Annual CO2 Emission (tons)'] = df_plant['CO2/MWh'] * h100_mwh_per_year

# Group by state and calculate averages
state_avg_h100 = (
    df_plant.groupby('Plant state abbreviation')['H100 Annual CO2 Emission (tons)']
    .mean()
    .reset_index()
    .rename(columns={
        'Plant state abbreviation': 'State',
        'H100 Annual CO2 Emission (tons)': 'Average H100 Annual CO2 Emission (tons)'
    })
)

state_avg_co2_per_mwh = (
    df_plant.groupby('Plant state abbreviation')['CO2/MWh']
    .mean()
    .reset_index()
    .rename(columns={
        'Plant state abbreviation': 'State',
        'CO2/MWh': 'Average CO2/MWh'
    })
)

# Merge the two summaries
state_summary = pd.merge(state_avg_co2_per_mwh, state_avg_h100, on='State')

# 🧮 Add estimated number of trees needed to offset CO₂
tree_absorption_tons_per_year = 0.048

state_summary['Estimated Trees to Offset H100 CO2'] = (
    state_summary['Average H100 Annual CO2 Emission (tons)'] / tree_absorption_tons_per_year
).round(0).astype(int)

# Convert to dictionary
state_summary_dict = state_summary.set_index('State').to_dict(orient='index')

# Save to JSON
with open('state_h100_emissions_summary.json', 'w') as f:
    json.dump(state_summary_dict, f, indent=2)

print("\n✅ JSON saved to 'state_h100_emissions_summary.json'")
