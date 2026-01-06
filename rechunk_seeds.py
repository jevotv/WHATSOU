import re

def chunk_sql_file(input_file, output_file, chunk_size=300):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the INSERT INTO districts statement
    # Pattern to find: INSERT INTO districts (city_id, name_ar, name_en) VALUES ...;
    # We assume it starts with "INSERT INTO districts" and ends with ";"
    
    start_marker = "INSERT INTO districts (city_id, name_ar, name_en) VALUES"
    start_index = content.find(start_marker)
    
    if start_index == -1:
        print("Could not find INSERT statement for districts")
        return

    # Find the end of the statement (last semicolon)
    # We assume the file ends with the insert statement or we just take the rest
    values_part = content[start_index + len(start_marker):].strip()
    if values_part.endswith(';'):
        values_part = values_part[:-1]
    
    # Split by schema: (id, 'name', 'name'), ...
    # This is tricky with regex because of potential commas in data, but these are simple names.
    # We can split by "), (" 
    
    # Normalize input to separate values
    # Remove leading newline/spaces
    values_part = values_part.strip()
    
    # Check if it starts with "("
    if not values_part.startswith('('):
         print("Unexpected format after VALUES")
         return

    # Initial split attempt
    # We replace "), (" with ")|split|(" to split safely? 
    # Or just use regex to match each (...) group
    
    # Regex for one group: \(\d+,\s*'.*?',\s*'.*?'\)
    # Matches: (1, 'name', 'name')
    pattern = re.compile(r"\(\d+,\s*'.*?',\s*'.*?'\)")
    matches = pattern.findall(values_part)
    
    print(f"Found {len(matches)} district entries.")
    
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("-- Re-seeding districts\n")
        out.write("DELETE FROM districts;\n")
        # Reset sequence if needed? serial handles it but IDs might get large if not reset.
        out.write("ALTER SEQUENCE districts_id_seq RESTART WITH 1;\n\n")
        
        current_chunk = []
        for i, match in enumerate(matches):
            current_chunk.append(match)
            
            if len(current_chunk) >= chunk_size:
                out.write(f"INSERT INTO districts (city_id, name_ar, name_en) VALUES\n{',\n'.join(current_chunk)};\n\n")
                current_chunk = []
        
        if current_chunk:
            out.write(f"INSERT INTO districts (city_id, name_ar, name_en) VALUES\n{',\n'.join(current_chunk)};\n\n")

if __name__ == "__main__":
    chunk_sql_file('d:\\whatsou\\egypt_locations.sql', 'd:\\whatsou\\reseed_districts.sql')
