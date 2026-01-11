from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction
        title = Text("Probability Problem", font_size=36)
        title.move_to(UP*3)
        self.play(Write(title))
        self.wait(1)

        # Step 2: Problem statement
        problem = Tex("A fair six-sided die is rolled. What is the probability of rolling a 4?")
        problem.move_to(UP*1.5)
        self.play(Write(problem))
        self.wait(2)

        # Step 3: Show possible outcomes
        outcomes = Tex("Possible outcomes: 1, 2, 3, 4, 5, 6")
        outcomes.move_to(DOWN*0.5)
        self.play(Write(outcomes))
        self.wait(2)

        # Step 4: Highlight favorable outcome
        favorable = Tex("Favorable outcome: 4")
        favorable.set_color(YELLOW)
        favorable.move_to(DOWN*1.5)
        self.play(Write(favorable))
        self.wait(1.5)

        # Step 5: Probability formula
        formula = MathTex("P(\\text{rolling a 4}) = \\frac{\\text{Number of favorable outcomes}}{\\text{Total number of possible outcomes}}")
        formula.move_to(DOWN*2.5)
        self.play(Write(formula))
        self.wait(2.5)

        # Step 6: Calculate probability
        calculation = MathTex("= \\frac{1}{6}")
        calculation.next_to(formula, DOWN)
        self.play(Write(calculation))
        self.wait(2)

        # Step 7: Summary
        summary = Tex("The probability of rolling a 4 is $\\frac{1}{6}$")
        summary.move_to(DOWN*3.5)
        self.play(Write(summary))
        self.wait(2)

        self.wait(1)  # Total duration placeholder