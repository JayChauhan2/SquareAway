import json
import csv

# Open the JSON dataset we built
with open("chatbot_training_data.json", "r") as f:
    data = json.load(f)

# Write it out to a CSV format that Google AI Studio accepts
with open("gemini_training_data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    # Write the header
    writer.writerow(["input_text", "output_text"])
    
    # Write the 276 examples
    for row in data:
        writer.writerow([row["input"], row["output"]])

print(f"Successfully converted {len(data)} examples to gemini_training_data.csv!")
