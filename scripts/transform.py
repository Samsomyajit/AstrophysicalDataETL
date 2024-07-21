import pandas as pd

def transform_data(input_file, output_file):
    df = pd.read_csv(input_file)
    # Perform any transformations needed
    df.to_csv(output_file, index=False)
    df.to_json(output_file.replace('.csv', '.json'), orient='records')

if __name__ == "__main__":
    transform_data('data/astrophysical_data.csv', 'data/astrophysical_data_cleaned.csv')
