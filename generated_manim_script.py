from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Introduction
        intro_text = Text("Introduction to Quadratic Equations").move_to(UP*2)
        self.play(FadeIn(intro_text))
        self.wait(1)
        self.play(FadeOut(intro_text))

        quadratic_equation = MathTex("ax^2 + bx + c = 0").move_to(UP*1 + LEFT*2)
        self.play(FadeIn(quadratic_equation))
        self.wait(2)
        self.play(FadeOut(quadratic_equation))

        # The Quadratic Formula
        quadratic_formula = MathTex("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}").move_to(UP*1.5)
        self.play(FadeIn(quadratic_formula))
        self.wait(2)
        coefficients_text = Text("a, b, and c represent coefficients").move_to(DOWN*1 + RIGHT*2)
        self.play(FadeIn(coefficients_text))
        self.wait(1)
        self.play(FadeOut(coefficients_text))

        # Introducing the Discriminant
        discriminant = MathTex("b^2 - 4ac").move_to(UP*2 + LEFT*3).set_color(YELLOW)
        self.play(FadeIn(discriminant), quadratic_formula.animate.move_to(UP*0.5 + RIGHT*3))
        self.wait(2)
        discriminant_text = Text("The discriminant").move_to(UP*2 + RIGHT*2)
        self.play(FadeIn(discriminant_text))
        self.wait(1)
        self.play(FadeOut(discriminant_text))

        # Positive Discriminant
        positive_example = MathTex("x^2 - 7x + 12 = 0").move_to(UP*2 + LEFT*3)
        self.play(FadeOut(discriminant), FadeOut(quadratic_formula), FadeIn(positive_example))
        self.wait(1)
        positive_discriminant = MathTex("b^2 - 4ac > 0").move_to(UP*1 + RIGHT*2)
        self.play(FadeIn(positive_discriminant))
        self.wait(1)
        positive_graph = Axes(
            x_range=[-1, 10, 1],
            y_range=[-10, 10, 2],
            x_length=8,
            y_length=4,
            axis_config={"include_tip": False},
        ).move_to(DOWN*2)
        self.play(FadeIn(positive_graph))
        parabola = positive_graph.plot(lambda x: x**2 - 7*x + 12, x_range=[-1, 10], color=BLUE)
        self.play(FadeIn(parabola))
        self.wait(2)
        self.play(FadeOut(positive_example), FadeOut(positive_discriminant), FadeOut(positive_graph), FadeOut(parabola))

        # Zero Discriminant
        zero_example = MathTex("x^2 - 4x + 4 = 0").move_to(UP*2 + LEFT*3)
        self.play(FadeIn(zero_example))
        self.wait(1)
        zero_discriminant = MathTex("b^2 - 4ac = 0").move_to(UP*1 + RIGHT*2)
        self.play(FadeIn(zero_discriminant))
        self.wait(1)
        zero_graph = Axes(
            x_range=[-1, 10, 1],
            y_range=[-10, 10, 2],
            x_length=8,
            y_length=4,
            axis_config={"include_tip": False},
        ).move_to(DOWN*2)
        self.play(FadeIn(zero_graph))
        parabola = zero_graph.plot(lambda x: (x-2)**2, x_range=[-1, 10], color=GREEN)
        self.play(FadeIn(parabola))
        self.wait(2)
        self.play(FadeOut(zero_example), FadeOut(zero_discriminant), FadeOut(zero_graph), FadeOut(parabola))

        # Negative Discriminant
        negative_example = MathTex("x^2 + 4x + 8 = 0").move_to(UP*2 + LEFT*3)
        self.play(FadeIn(negative_example))
        self.wait(1)
        negative_discriminant = MathTex("b^2 - 4ac < 0").move_to(UP*1 + RIGHT*2)
        self.play(FadeIn(negative_discriminant))
        self.wait(1)
        negative_graph = Axes(
            x_range=[-10, 10, 2],
            y_range=[-10, 10, 2],
            x_length=8,
            y_length=4,
            axis_config={"include_tip": False},
        ).move_to(DOWN*2)
        self.play(FadeIn(negative_graph))
        parabola = negative_graph.plot(lambda x: x**2 + 4*x + 8, x_range=[-10, 10], color=RED)
        self.play(FadeIn(parabola))
        self.wait(2)
        self.play(FadeOut(negative_example), FadeOut(negative_discriminant), FadeOut(negative_graph), FadeOut(parabola))

        # Summary
        summary_text = Text("Summary").move_to(UP*2)
        self.play(FadeIn(summary_text))
        self.wait(1)
        summary_table = Text("Positive: 2 real roots, Zero: 1 real root, Negative: 2 complex roots").move_to(DOWN*1 + LEFT*2)
        self.play(FadeIn(summary_table))
        self.wait(3)
        self.play(FadeOut(summary_text), FadeOut(summary_table))

        self.wait(2)