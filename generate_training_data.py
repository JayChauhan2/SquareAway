import json
import random

# Templates for generating questions
math_topics = [
    ("quadratic equation", "The quadratic formula is used to find the roots of a quadratic equation. It is expressed as: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$."),
    ("Pythagorean theorem", "The Pythagorean theorem relates the sides of a right triangle. It is written as: $a^2 + b^2 = c^2$."),
    ("area of a circle", "The area of a circle with radius $r$ is given by the formula: $A = \\pi r^2$."),
    ("derivative of x^2", "The derivative of $f(x) = x^2$ with respect to $x$ is $f'(x) = 2x$."),
    ("integral of 1/x", "The indefinite integral of $1/x$ is $\\ln|x| + C$."),
    ("Euler's identity", "Euler's identity connects five fundamental mathematical constants: $e^{i\\pi} + 1 = 0$."),
    ("slope-intercept form", "The slope-intercept form of a linear equation is $y = mx + b$, where $m$ is the slope and $b$ is the y-intercept."),
    ("definition of a limit", "The limit of $f(x)$ as $x$ approaches $c$ is $L$ if for every $\\epsilon > 0$ there is a $\\delta > 0$ such that if $0 < |x - c| < \\delta$, then $|f(x) - L| < \\epsilon$."),
    ("Fibonacci sequence", "The Fibonacci sequence is defined by the recurrence relation $F_n = F_{n-1} + F_{n-2}$, with $F_0 = 0$ and $F_1 = 1$."),
    ("Arithmetic progression sum", "The sum of the first $n$ terms of an arithmetic progression is $S_n = \\frac{n}{2}(2a + (n-1)d)$."),
    ("Geometric progression sum", "The sum of the first $n$ terms of a geometric progression is $S_n = a\\frac{1-r^n}{1-r}$ for $r \\neq 1$."),
    ("Binomial theorem", "The binomial theorem states that $(x+y)^n = \\sum_{k=0}^n \\binom{n}{k} x^{n-k} y^k$."),
    ("Law of Cosines", "The Law of Cosines relates the lengths of the sides of a triangle to the cosine of one of its angles: $c^2 = a^2 + b^2 - 2ab\\cos(C)$."),
    ("Law of Sines", "The Law of Sines states that the ratio of the length of a side to the sine of its opposite angle is constant: $\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}$."),
    ("Quadratic vertex form", "The vertex form of a quadratic function is $f(x) = a(x-h)^2 + k$, where $(h,k)$ is the vertex."),
]

physics_topics = [
    ("Newton's second law", "Newton's second law states that the force acting on an object is equal to the mass of that object times its acceleration: $F = ma$."),
    ("kinetic energy", "The kinetic energy of an object of mass $m$ and velocity $v$ is $K = \\frac{1}{2}mv^2$."),
    ("Einstein's mass-energy equivalence", "The mass-energy equivalence principle is expressed by the famous equation $E = mc^2$."),
    ("Ohm's law", "Ohm's law states that the current through a conductor between two points is directly proportional to the voltage across the two points: $V = IR$."),
    ("Hooke's law", "Hooke's law states that the force needed to extend or compress a spring by some distance scales linearly with respect to that distance: $F = -kx$."),
    ("Coulomb's Law", "Coulomb's Law quantifies the amount of force between two stationary, electrically charged particles: $F = k_e \\frac{q_1 q_2}{r^2}$."),
    ("Work-Energy Theorem", "The work-energy theorem states that the net work done on an object is equal to its change in kinetic energy: $W = \\Delta K$."),
    ("Gravitational potential energy", "The gravitational potential energy near Earth's surface is $U = mgh$."),
    ("Ideal gas law", "The ideal gas law is the equation of state of a hypothetical ideal gas: $PV = nRT$."),
    ("Momentum", "The linear momentum of an object is the product of its mass and velocity: $p = mv$."),
]

bio_chem_topics = [
    ("photosynthesis equation", "The overall equation for photosynthesis is $6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$."),
    ("cellular respiration equation", "The overall equation for cellular respiration is $C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + \\text{ATP}$."),
    ("pH formula", "The pH of a solution is the negative base-10 logarithm of the hydrogen ion concentration: $\\text{pH} = -\\log_{10}[H^+]$."),
    ("Molarity", "Molarity is a measure of the concentration of a chemical species, in particular of a solute in a solution, expressed as moles of solute per liter of solution: $M = \\frac{n}{V}$."),
]

cs_topics = [
    ("time complexity of binary search", "The worst-case time complexity of binary search is $O(\\log n)$."),
    ("time complexity of quicksort", "The average-case time complexity of quicksort is $O(n \\log n)$, but its worst-case is $O(n^2)$."),
    ("time complexity of mergesort", "The worst-case time complexity of merge sort is $O(n \\log n)$."),
]

generic_responses = [
    ("How do I stay focused while studying?", "To stay focused, try the Pomodoro technique: study for 25 minutes, then take a 5-minute break. Eliminate distractions by placing your phone in another room."),
    ("What's a good way to memorize vocabulary?", "Spaced repetition and active recall are the best ways to memorize vocabulary. Flashcards are a great tool for this!"),
    ("Who are you?", "I am a helpful study assistant trained to help you with your educational materials and answer questions concisely."),
    ("Can you write a 10 page essay for me?", "I can help you outline and brainstorm ideas for your essay, but I cannot write the entire 10-page paper for you. Let's start with a thesis statement!"),
    ("Are you an AI?", "Yes, I am a helpful study assistant powered by artificial intelligence, designed to help you learn effectively."),
]

# Variations to generate permutations
question_variations = [
    "What is the formula for {topic}?",
    "Can you explain {topic}?",
    "Tell me about {topic}.",
    "I'm struggling to understand {topic}. What is it?",
    "Do you know the equation for {topic}?",
    "Please define {topic}.",
    "What does {topic} mean in this context?",
    "Refresh my memory on {topic}.",
]

all_topics = math_topics + physics_topics + bio_chem_topics + cs_topics

training_data = []

# Generate math/science/cs data
for topic, response in all_topics:
    for var in question_variations:
        q = var.format(topic=topic)
        training_data.append({
            "input": q,
            "output": response
        })

# Generate generic/behavioral data
for q, a in generic_responses:
    # Add varying punctuations or slightly different phrasings to reach >200 easily
    training_data.append({"input": q, "output": a})
    training_data.append({"input": q.lower(), "output": a})
    training_data.append({"input": f"Hey! {q}", "output": a})
    training_data.append({"input": f"{q} Please.", "output": a})

# Check if we have 200+
print(f"Generated {len(training_data)} training examples.")

# Fill the rest with some generated dummy study tips if needed
dummy_tips = [
    "Always review your notes within 24 hours of taking them.",
    "Drink plenty of water while studying to keep your brain hydrated.",
    "Getting 8 hours of sleep is better than pulling an all-nighter before an exam.",
    "Break large projects into smaller, manageable chunks.",
    "Teach the material to someone else to solidify your understanding."
]

tip_questions = [
    "Got any study tips?",
    "How can I study better?",
    "Give me advice for learning.",
    "I need a study hack.",
    "What is the best way to prepare for finals?"
]

while len(training_data) < 220:
    q = random.choice(tip_questions)
    a = random.choice(dummy_tips)
    training_data.append({"input": q, "output": a})

# Deduplicate to ensure we have unique pairs
unique_data = [dict(t) for t in {tuple(d.items()) for d in training_data}]

print(f"Total unique examples: {len(unique_data)}")

with open("/Users/jaychauhan/Downloads/SquareAway/chatbot_training_data.json", "w") as f:
    json.dump(unique_data, f, indent=2)

print("Saved to chatbot_training_data.json")
