import requests
import pandas as pd

def fetch_data(api_key, start_date, end_date):
    url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={start_date}&end_date={end_date}&api_key={api_key}"
    response = requests.get(url)
    data = response.json()
    return data

def parse_data(data):
    records = []
    for date in data['near_earth_objects']:
        for neo in data['near_earth_objects'][date]:
            records.append({
                'name': neo['name'],
                'diameter': neo['estimated_diameter']['kilometers']['estimated_diameter_max'],
                'distance': neo['close_approach_data'][0]['miss_distance']['kilometers']
            })
    return pd.DataFrame(records)

if __name__ == "__main__":
    API_KEY = "38SJCZVdbm6elgQwhnyRFFW4j4sTQTadrKhCee6Z"
    START_DATE = "2023-01-01"
    END_DATE = "2023-01-07"
    data = fetch_data(API_KEY, START_DATE, END_DATE)
    df = parse_data(data)
    df.to_csv('data/astrophysical_data.csv', index=False)
    df.to_json('data/astrophysical_data.json', orient='records')
