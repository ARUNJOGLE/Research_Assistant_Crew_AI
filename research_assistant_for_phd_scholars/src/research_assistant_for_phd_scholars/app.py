from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import subprocess
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def serve_index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        query = data.get('query', '')
        search_type = data.get('type', 'web')

        # Run main.py with the query as input
        process = subprocess.Popen(['python', 'main.py'], 
                                 stdin=subprocess.PIPE, 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE,
                                 text=True)
        
        # Send the query to main.py and add a newline to simulate Enter key
        stdout, stderr = process.communicate(input=f"{query}\n")

        if stderr:
            print("Error from main.py:", stderr)
            return jsonify({
                'error': 'Error processing your request. Please try again.'
            }), 500

        # Read the generated report.md file
        try:
            with open('report.md', 'r', encoding='utf-8') as f:
                report_content = f.read()
        except FileNotFoundError:
            return jsonify({
                'error': 'Report generation failed. Please try again.'
            }), 500

        # Format the results
        results = format_report_as_results(report_content)
        
        return jsonify({
            'results': results,
            'query': query,
            'type': search_type
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({
            'error': str(e)
        }), 500

def format_report_as_results(report_content):
    # Split the report into sections
    sections = report_content.split('\n\n')
    
    results = []
    current_section = {'title': '', 'description': '', 'url': ''}
    
    for section in sections:
        if section.strip():
            # Check if it's a header
            if section.startswith('#'):
                # If we have a previous section, add it to results
                if current_section['title']:
                    results.append(current_section.copy())
                current_section['title'] = section.lstrip('#').strip()
                current_section['description'] = ''
            else:
                # Append to current section description
                if current_section['description']:
                    current_section['description'] += '\n\n'
                current_section['description'] += section.strip()
    
    # Add the last section
    if current_section['title']:
        results.append(current_section)
    
    # If no sections were found, create a single result
    if not results:
        results.append({
            'title': 'Search Results',
            'description': report_content,
            'url': ''
        })
    
    return results

if __name__ == '__main__':
    app.run(debug=True, port=5000) 