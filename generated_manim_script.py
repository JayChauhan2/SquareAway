from manim import *

class Explainer(Scene):
    def construct(self):
        # Step 1: Introduction
        problem = MathTex("\\int_{1/2}^{8} \\left(2 - \\frac{1}{x}\\right) dx").move_to(UP*2)
        self.play(Write(problem))
        self.wait(1)

        # Step 2: Finding the antiderivative
        self.play(FadeOut(problem))
        integrand = MathTex("2 - \\frac{1}{x}").move_to(UP*2)
        antiderivative1 = Tex("The antiderivative of 2 is $2x$.").move_to(UP*0.5)
        antiderivative2 = Tex("The antiderivative of $-\\frac{1}{x}$ is $-\\ln x$.").move_to(DOWN*0.5)
        antiderivative = MathTex("[2x - \\ln x]").move_to(DOWN*2)
        self.play(Write(integrand))
        self.wait(0.5)
        self.play(Write(antiderivative1))
        self.wait(0.5)
        self.play(Write(antiderivative2))
        self.wait(0.5)
        self.play(Write(antiderivative))
        self.wait(1)
        self.clear()

        # Step 3: Applying the Fundamental Theorem of Calculus
        ftc = Tex("Apply the Fundamental Theorem of Calculus").move_to(UP*2)
        evaluation = MathTex("[2x - \\ln x]_{1/2}^{8}").move_to(UP*0.5)
        upper_limit = MathTex("(2 \\cdot 8 - \\ln 8)").move_to(DOWN*0.5 + LEFT*2)
        lower_limit = MathTex("\\left(2 \\cdot \\frac{1}{2} - \\ln \\frac{1}{2}\\right)").move_to(DOWN*0.5 + RIGHT*2)
        subtraction = MathTex("(16 - \\ln 8) - (1 - \\ln 0.5)").move_to(DOWN*2)
        self.play(Write(ftc))
        self.wait(0.5)
        self.play(Write(evaluation))
        self.wait(0.5)
        self.play(Write(upper_limit), Write(lower_limit))
        self.wait(0.5)
        self.play(Write(subtraction))
        self.wait(1)
        self.clear()

        # Step 4: Simplifying logarithmic terms
        expression = MathTex("16 - \\ln 8 - 1 + \\ln 0.5").move_to(UP*0.5)
        simplification = Tex("Remember that $\\ln 0.5 = \\ln (1/2) = -\\ln 2$.").move_to(UP*2)
        substitution = MathTex("15 - \\ln 8 + (-\\ln 2)").move_to(DOWN*0.5)
        self.play(Write(expression))
        self.wait(0.5)
        self.play(Write(simplification))
        self.wait(0.5)
        self.play(Write(substitution))
        self.wait(1)
        self.clear()

        # Step 5: Combining logarithmic terms
        log_property = Tex("Using the logarithm property $\\ln a + \\ln b = \\ln(ab)$:").move_to(UP*2)
        combination = MathTex("15 - (\\ln 8 + \\ln 2)").move_to(UP*0.5)
        simplification2 = MathTex("= 15 - \\ln (8 \\cdot 2)").move_to(DOWN*0.5)
        final_expression = MathTex("= 15 - \\ln 16").move_to(DOWN*2)
        self.play(Write(log_property))
        self.wait(0.5)
        self.play(Write(combination))
        self.wait(0.5)
        self.play(Write(simplification2))
        self.wait(0.5)
        self.play(Write(final_expression))
        self.wait(1)
        self.clear()

        # Final Answer
        final_answer = Tex("The final answer is $15 - \\ln 16$.").move_to(ORIGIN)
        self.play(Write(final_answer))
        self.wait(2)

        # Recap
        recap = Tex("Recap: Finding the antiderivative and applying the Fundamental Theorem of Calculus").move_to(UP*2)
        self.play(FadeOut(final_answer))
        self.play(Write(recap))
        self.wait(2)
        self.wait(1)