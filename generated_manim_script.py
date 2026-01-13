from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction - 2nd Derivatives
        title = Tex("2nd Derivatives").move_to(UP*3)
        self.play(Write(title))
        self.wait(2)
        self.clear()

        # Step 2: Concavity Explanation
        concavity_text = Tex("Second derivative describes concavity").move_to(UP*2)
        positive_concavity = Tex("Positive 2nd derivative: Concave Up").move_to(UP*0.5 + LEFT*3)
        negative_concavity = Tex("Negative 2nd derivative: Concave Down").move_to(UP*0.5 + RIGHT*3)
        self.play(Write(concavity_text))
        self.play(Write(positive_concavity), Write(negative_concavity))
        self.wait(3)
        self.clear()

        # Step 3: Example f(x) = x^2
        example_fx = MathTex("f(x) = x^2").move_to(UP*2)
        first_derivative = MathTex("f'(x) = 2x").move_to(UP*0.5 + LEFT*3)
        second_derivative = MathTex("f''(x) = 2").move_to(UP*0.5 + RIGHT*3)
        graph_x2 = Axes(x_range=[-5, 5, 1], y_range=[-1, 26, 1], x_length=6, y_length=4).move_to(DOWN*1.5)
        graph_x2_func = graph_x2.plot(lambda x: x**2, color=BLUE)
        self.play(Write(example_fx))
        self.play(Write(first_derivative), Write(second_derivative))
        self.play(Create(graph_x2), Create(graph_x2_func))
        self.wait(3)
        self.clear()

        # Step 4: Example f(x) = -x^2
        example_neg_fx = MathTex("f(x) = -x^2").move_to(UP*2)
        first_derivative_neg = MathTex("f'(x) = -2x").move_to(UP*0.5 + LEFT*3)
        second_derivative_neg = MathTex("f''(x) = -2").move_to(UP*0.5 + RIGHT*3)
        graph_neg_x2 = Axes(x_range=[-5, 5, 1], y_range=[-26, 1, 1], x_length=6, y_length=4).move_to(DOWN*1.5)
        graph_neg_x2_func = graph_neg_x2.plot(lambda x: -x**2, color=RED)
        self.play(Write(example_neg_fx))
        self.play(Write(first_derivative_neg), Write(second_derivative_neg))
        self.play(Create(graph_neg_x2), Create(graph_neg_x2_func))
        self.wait(3)
        self.clear()

        # Step 5: Inflection Points
        inflection_text = Tex("Inflection Points: where concavity changes").move_to(UP*2)
        inflection_condition = Tex("f''(x) = 0 or undefined").move_to(UP*0.5)
        self.play(Write(inflection_text))
        self.play(Write(inflection_condition))
        self.wait(3)
        self.clear()