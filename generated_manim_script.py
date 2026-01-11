from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Title and introduction
        title = Text("Estimating Area Between Curves", font_size=36)
        title.move_to(UP*3)
        self.play(Write(title))
        self.wait(1)

        # Step 2: Example with functions
        example_title = Text("Example: y = 2 - x and y = x²", font_size=30)
        example_title.move_to(UP*2)

        height_eq = MathTex("(2 - x) - x^2", font_size=30)
        height_eq.move_to(UP*0.5)

        delta_x = MathTex("\\Delta x = \\frac{3.5}{n}", font_size=30)
        delta_x.move_to(DOWN*0.5)

        integral = MathTex("\\int_{-2}^{1.5} \\left[ (2 - x) - x^2 \\right] \, dx", font_size=30)
        integral.move_to(DOWN*1.5)

        self.play(Transform(title, example_title))
        self.play(Write(height_eq))
        self.wait(0.5)
        self.play(Write(delta_x))
        self.wait(0.5)
        self.play(Write(integral))
        self.wait(2)

        # Step 3: Negative integral values explanation
        self.clear()
        neg_title = Text("Negative Integral Values", font_size=36)
        neg_title.move_to(UP*3)

        explanation = Tex("Net signed area:", font_size=30)
        explanation.move_to(UP*1)

        positive_areas = Tex("• Regions above x-axis: positive contribution", font_size=28)
        positive_areas.next_to(explanation, DOWN)

        negative_areas = Tex("• Regions below x-axis: negative contribution", font_size=28)
        negative_areas.next_to(positive_areas, DOWN)

        formula = MathTex("A + C + E - B - D", font_size=30)
        formula.next_to(negative_areas, DOWN)

        self.play(Write(neg_title))
        self.play(Write(explanation))
        self.play(Write(positive_areas))
        self.play(Write(negative_areas))
        self.play(Write(formula))
        self.wait(2)

        # Step 4: Midpoint Rule comparison
        self.clear()
        midpoint_title = Text("Midpoint Rule Comparison", font_size=36)
        midpoint_title.move_to(UP*3)

        left = Tex("1. Left Riemann Sum", font_size=28)
        left.move_to(UP*1 + LEFT*3)

        right = Tex("2. Right Riemann Sum", font_size=28)
        right.move_to(UP*1 + RIGHT*3)

        midpoint = Tex("3. Midpoint Rule", font_size=28)
        midpoint.move_to(DOWN*0.5)

        midpoint_advantage = Tex("• Cancels out errors", font_size=26)
        midpoint_advantage.next_to(midpoint, DOWN)

        linear_exact = Tex("• Exact for linear functions", font_size=26)
        linear_exact.next_to(midpoint_advantage, DOWN)

        accuracy = Tex("• More accurate than left/right sums", font_size=26)
        accuracy.next_to(linear_exact, DOWN)

        self.play(Write(midpoint_title))
        self.play(Write(left), Write(right))
        self.wait(1)
        self.play(Write(midpoint))
        self.play(Write(midpoint_advantage))
        self.play(Write(linear_exact))
        self.play(Write(accuracy))
        self.wait(3)

        # Final wait to match voiceover length
        self.wait(1)