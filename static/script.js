
const allSymptoms = [ "headache", "fever", "mild_fever", "high_fever", "fatigue", "chills", "shivering", 
  "sweating", "malaise", "lethargy", "restlessness", "weight_loss", "weight_gain", 
  "dehydration", "weakness_in_limbs", "dizziness", "loss_of_balance", "unsteadiness",
  "spinning_movements", "movement_stiffness", "stiff_neck", "neck_pain", "back_pain",
  "knee_pain", "hip_joint_pain", "joint_pain", "muscle_pain", "muscle_weakness", 
  "muscle_wasting", "cramps", "bruising", "obesity", "cold_hands_and_feet",
  "puffy_face_and_eyes", "swollen_extremeties", "swollen_legs", "swelling_joints",
  "swollen_blood_vessels", "prominent_veins_on_calf", "painful_walking",
  "cough", "continuous_sneezing", "runny_nose", "congestion", "sinus_pressure", 
  "breathlessness", "phlegm", "rusty_sputum", "mucoid_sputum", "throat_irritation", 
  "patches_in_throat", "chest_pain", "fast_heart_rate", "palpitations",
  "nausea", "vomiting", "diarrhoea", "constipation", "abdominal_pain", "stomach_pain", 
  "belly_pain", "indigestion", "acidity", "loss_of_appetite", "excessive_hunger", 
  "increased_appetite", "pain_during_bowel_movements", "pain_in_anal_region", 
  "bloody_stool", "irritation_in_anus", "passage_of_gases", "swelling_of_stomach", 
  "distention_of_abdomen", "stomach_bleeding",
  "burning_micturition", "spotting_urination", "dark_urine", "yellow_urine", 
  "bladder_discomfort", "foul_smell_of_urine", "continuous_feel_of_urine", 
  "polyuria",
  "itching", "skin_rash", "nodal_skin_eruptions", "red_spots_over_body", 
  "dischromic_patches", "skin_peeling", "scurring", "blister", "blackheads", 
  "pus_filled_pimples", "red_sore_around_nose", "yellow_crust_ooze", 
  "silver_like_dusting", "inflammatory_nails", "brittle_nails", "small_dents_in_nails",
  "redness_of_eyes", "yellowing_of_eyes", "sunken_eyes", "blurred_and_distorted_vision", 
  "watering_from_eyes", "visual_disturbances", "pain_behind_the_eyes",
  "anxiety", "mood_swings", "irritability", "depression", "altered_sensorium", 
  "slurred_speech", "weakness_of_one_body_side", "loss_of_smell", "coma", 
  "lack_of_concentration", "drying_and_tingling_lips",
  "ulcers_on_tongue", "enlarged_thyroid", "brittle_nails", "toxic_look_(typhos)", 
  "internal_itching", "abnormal_menstruation", "extra_marital_contacts", 
  "family_history", "history_of_alcohol_consumption", "receiving_blood_transfusion", 
  "receiving_unsterile_injections", "fluid_overload", "fluid_overload.1", 
  "blood_in_sputum", "irregular_sugar_level" ];

let selectedSymptoms = [];

// Levenshtein Distance Function
function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function filterSymptoms() {
  const input = document.getElementById("symptomInput").value.toLowerCase().replace(/[.,!?]/g, "").trim();

  const suggestions = allSymptoms
    .map(symptom => ({
      symptom,
      score: input ? levenshtein(symptom.toLowerCase(), input) : 0
    }))
   

    .filter(item =>
      (!input || item.symptom.toLowerCase().includes(input)) &&
      !selectedSymptoms.includes(item.symptom)
    )
    
    .sort((a, b) => a.score - b.score)
    .map(item => item.symptom);

  showSuggestions(suggestions);
}

function showSuggestions(suggestions) {
  const suggestionsList = document.getElementById("suggestionsList");
  suggestionsList.innerHTML = "";
  suggestions.forEach(symptom => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = symptom;
    checkbox.onchange = () => toggleSymptom(symptom, checkbox.checked);

    const label = document.createElement("label");
    label.style.marginLeft = "8px";
    label.textContent = symptom;

    li.appendChild(checkbox);
    li.appendChild(label);
    suggestionsList.appendChild(li);
  });
}

function toggleSymptom(symptom, isChecked) {
  if (isChecked && !selectedSymptoms.includes(symptom)) {
    selectedSymptoms.push(symptom);
    document.getElementById("symptomInput").value = ""; 
  } else if (!isChecked) {
    selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
  }
  updateSelectedSymptoms();
}

function updateSelectedSymptoms() {
  const selectedBox = document.getElementById("selectedSymptoms");
  selectedBox.innerHTML = "";
  selectedSymptoms.forEach(symptom => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `${symptom} <span class="remove-btn" onclick="removeSymptom('${symptom}')">&times;</span>`;
    selectedBox.appendChild(tag);
  });
  filterSymptoms();
}

function removeSymptom(symptom) {
  selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
  updateSelectedSymptoms();
}

function predictDisease() {
  if (selectedSymptoms.length === 0) {
    alert("Please select at least one symptom before predicting.");
    return;
  }
  
  document.getElementById("loader").style.display = "block";
  document.getElementById("clearBtn").style.display = "inline-block";
  

  fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms: selectedSymptoms })
  })
    .then(res => res.json())
    .then(data => {
      setTimeout(() => {
        document.getElementById("loader").style.display = "none";
        document.getElementById("predictionResult").innerHTML =
          `<h2>Prediction: You may have <span style='color: #2e7d32'>${data.prediction}</span></h2>`;
    
        document.getElementById("hospitalSection").style.display = "block";
      }, 2000); // 800 milliseconds delay
    })
    
    .catch(err => {
      document.getElementById("loader").style.display = "none";
      alert("Something went wrong while predicting the disease.");
    });
}

function clearResponse() {
  selectedSymptoms = [];
  document.getElementById("symptomInput").value = "";
  document.getElementById("suggestionsList").innerHTML = "";
  updateSelectedSymptoms();
  document.getElementById("predictionResult").innerHTML = "";
  document.getElementById("clearBtn").style.display = "none";

  document.getElementById("hospitalSection").style.display = "none";
}

// 🎤 Voice Input
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function (event) {
    let transcript = event.results[0][0].transcript.toLowerCase().trim();
    transcript = transcript.replace(/[.,!?]/g, "");
    transcript = transcript.replace(/\s+/g, "_");
    const inputField = document.getElementById("symptomInput");
    inputField.value = transcript;
    inputField.dispatchEvent(new Event("input", { bubbles: true }));
  };

  recognition.onerror = function (event) {
    alert("Voice input error: " + event.error);
  };
}

// 👇 Show all symptoms initially
window.onload = () => filterSymptoms();



function findHospitals() {
  const location = document.getElementById("locationInput").value.trim();
  if (!location) {
    alert("Please enter your city or location.");
    return;
  }

  const query = encodeURIComponent(`hospitals near ${location}`);
  window.open(`https://www.google.com/maps/search/${query}`, "_blank");
}
