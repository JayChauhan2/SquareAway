from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction
        title = Tex("True/False Statement").to_edge(UP)
        statement = Tex("The area between $y = x^2$ and $y = x$ from $x = 0$ to $x = 1$ is calculated as the integral of $x - x^2$ over that interval.")
        statement.move_to(UP*0.5)
        self.play(Write(title))
        self.wait(0.5)
        self.play(Write(statement))
        self.wait(2)

        # Step 2: Visual representation
        self.clear()
        axes = Axes(
            x_range=[0, 1.5, 0.5],
            y_range=[0, 1.5, 0.5],
            axis_config={"color": BLUE},
        )
        axes.to_edge(DOWN)

        # Graph of y = x^2
        parabola = axes.plot(lambda x: x**2, color=RED)
        parabola_label = MathTex("y = x^2").next_to(parabola, UP, buff=0.1).set_color(RED)

        # Graph of y = x
        line = axes.plot(lambda x: x, color=GREEN)
        line_label = MathTex("y = x").next_to(line, UP, buff=0.1).set_color(GREEN)

        self.play(Create(axes))
        self.play(Create(parabola), Write(parabola_label))
        self.play(Create(line), Write(line_label))
        self.wait(2)

        # Step 3: Explanation of the integral
        integral = MathTex(r"\int_{0}^{1} (x - x^2) \, dx").move_to(UP*2)
        explanation = Tex("Top function minus bottom function").next_to(integral, DOWN)
        self.play(Write(integral))
        self.wait(0.5)
        self.play(Write(explanation))
        self.wait(2)

        # Step 4: Visual demonstration of area
        area = axes.get_area(parabola, x_range=[0, 1], color=BLUE, opacity=0.5)
        area_label = Tex("Area between curves").next_to(area, UP)
        self.play(FadeIn(area), Write(area_label))
        self.wait(2)

        # Step 5: Conclusion
        self.clear()
        conclusion = Tex("The statement is TRUE!").scale(1.5).set_color(GREEN)
        self.play(Write(conclusion))
        self.wait(2)

        self.wait(1)  # Total duration placeholder