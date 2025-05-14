from flask import Flask, request, jsonify, render_template
from joblib import load
import pandas as pd
from collections import Counter

app = Flask(__name__)

# Home route to serve the frontend
@app.route('/')
def home():
    return render_template('index.html')  # This loads templates/index.html

@app.route("/about")
def about():
    return render_template("about.html")


# Load training data
df = pd.read_csv("Training.csv")
symptoms_list = df.columns[:-1]
disease_classes = sorted(df["prognosis"].unique())
symptom_index = {symptom: i for i, symptom in enumerate(symptoms_list)}

# Load all models
rf_model = load("random_forest_model.joblib")
svm_model = load("svm_model.joblib")
nb_model = load("naive_bayes_model.joblib")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    selected_symptoms = data.get("symptoms", [])

    # Build input vector
    input_vector = [0] * len(symptom_index)
    for symptom in selected_symptoms:
        if symptom in symptom_index:
            input_vector[symptom_index[symptom]] = 1

    # Predict using all 3 models
    pred1 = rf_model.predict([input_vector])[0]
    pred2 = svm_model.predict([input_vector])[0]
    pred3 = nb_model.predict([input_vector])[0]

    # Majority voting
    final_prediction = Counter([pred1, pred2, pred3]).most_common(1)[0][0]

    return jsonify({
        "prediction": final_prediction,
        "votes": {
            "random_forest": pred1,
            "svm": pred2,
            "naive_bayes": pred3
        }
    })

if __name__ == "__main__":
    app.run(debug=True)
