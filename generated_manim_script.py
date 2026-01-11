from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction
        title = Text("Estimating Area Between Curves", font_size=36)
        title.move_to(UP*3)
        intro = Tex("We estimate area using rectangles and take the limit to get the definite integral.")
        intro.move_to(UP*1)
        self.play(Write(title), run_time=1)
        self.wait(0.5)
        self.play(Write(intro), run_time=2)
        self.wait(1)

        # Step 2: Visual demonstration of area between curves
        self.clear()
        axes = Axes(
            x_range=[-2, 1.5, 0.5],
            y_range=[-1, 3, 1],
            axis_config={"color": BLUE},
        )
        axes.move_to(ORIGIN)
        graph1 = axes.plot(lambda x: 2 - x, color=GREEN)
        graph2 = axes.plot(lambda x: x**2, color=RED)
        area = axes.get_area_between_curves(x_range=[-2, 1.5], graph1=graph1, graph2=graph2, color=YELLOW, opacity=0.5)
        self.play(Create(axes), run_time=1)
        self.play(Create(graph1), Create(graph2), run_time=2)
        self.play(FadeIn(area), run_time=1)
        self.wait(1)

        # Step 3: Explanation of height and delta x
        self.clear()
        height_eq = MathTex("Height = (2 - x) - x^2")
        height_eq.move_to(UP*2)
        delta_x_eq = MathTex("\\Delta x = \\frac{1.5 - (-2)}{n} = \\frac{3.5}{n}")
        delta_x_eq.move_to(UP*0.5)
        self.play(Write(height_eq), run_time=1)
        self.wait(0.5)
        self.play(Write(delta_x_eq), run_time=1)
        self.wait(1)

        # Step 4: Riemann sum formula
        self.clear()
        riemann_sum = MathTex("\\sum_{i=1}^{n} \\left[ (2 - x_{i-1}) - x_{i-1}^2 \\right] \\Delta x")
        riemann_sum.move_to(ORIGIN)
        self.play(Write(riemann_sum), run_time=2)
        self.wait(1)

        # Step 5: Definite integral formula
        self.clear()
        integral = MathTex("\\int_{-2}^{1.5} \\left[ (2 - x) - x^2 \\right] \, dx")
        integral.move_to(ORIGIN)
        self.play(Write(integral), run_time=2)
        self.wait(1)

        # Step 6: Negative integral values with net area explanation
        self.clear()
        axes2 = Axes(
            x_range=[-2, 2, 1],
            y_range=[-2, 2, 1],
            axis_config={"color": BLUE},
        )
        axes2.move_to(ORIGIN)
        graph3 = axes2.plot(lambda x: x**3 - x, color=PURPLE)
        area_A = axes2.get_area(graph3, x_range=[-2, -1], color=GREEN, opacity=0.5)
        area_B = axes2.get_area(graph3, x_range=[-1, 0], color=RED, opacity=0.5)
        area_C = axes2.get_area(graph3, x_range=[0, 1], color=GREEN, opacity=0.5)
        area_D = axes2.get_area(graph3, x_range=[1, 2], color=RED, opacity=0.5)
        label_A = MathTex("A").next_to(area_A, UP)
        label_B = MathTex("B").next_to(area_B, UP)
        label_C = MathTex("C").next_to(area_C, UP)
        label_D = MathTex("D").next_to(area_D, UP)
        net_area_label = MathTex("Net Area = (A + C) - (B + D)", font_size=24).move_to(DOWN*2)
        total_area_label = MathTex("Total Area = A + B + C + D", font_size=24).move_to(DOWN*2.5)
        self.play(Create(axes2), run_time=1)
        self.play(Create(graph3), run_time=2)
        self.play(FadeIn(area_A), FadeIn(area_B), FadeIn(area_C), FadeIn(area_D), run_time=1)
        self.play(Write(label_A), Write(label_B), Write(label_C), Write(label_D), run_time=1)
        self.wait(1)
        integral_neg = MathTex("\\int_{a}^{b} f(t) \, dt = A + C - B - D")
        integral_neg.move_to(DOWN*3)
        self.play(Write(net_area_label), run_time=1)
        self.wait(0.5)
        self.play(Write(total_area_label), run_time=1)
        self.wait(0.5)
        self.play(Write(integral_neg), run_time=2)
        self.wait(1)

        # Step 7: Introduction to Midpoint Rule
        self.clear()
        midpoint_title = Text("Midpoint Rule", font_size=36)
        midpoint_title.move_to(UP*3)
        midpoint_intro = Tex("A more accurate method than Left and Right Riemann sums.")
        midpoint_intro.move_to(UP*1)
        self.play(Write(midpoint_title), run_time=1)
        self.wait(0.5)
        self.play(Write(midpoint_intro), run_time=2)
        self.wait(1)

        # Step 8: Visual comparison of Riemann sums
        self.clear()
        axes3 = Axes(
            x_range=[0, 3, 1],
            y_range=[0, 3, 1],
            axis_config={"color": BLUE},
        )
        axes3.move_to(ORIGIN)
        graph4 = axes3.plot(lambda x: x**2, color=GREEN)

        # Left Riemann sum
        left_rects = VGroup()
        for i in range(3):
            x_start = i
            x_end = x_start + 1
            rect = Rectangle(
                height=graph4.underlying_function(x_start),
                width=1,
                color=RED,
                fill_opacity=0.5
            )
            rect.move_to(axes3.c2p(x_start + 0.5, graph4.underlying_function(x_start)/2))
            left_rects.add(rect)

        # Right Riemann sum
        right_rects = VGroup()
        for i in range(3):
            x_start = i
            x_end = x_start + 1
            rect = Rectangle(
                height=graph4.underlying_function(x_end),
                width=1,
                color=BLUE,
                fill_opacity=0.5
            )
            rect.move_to(axes3.c2p(x_start + 0.5, graph4.underlying_function(x_end)/2))
            right_rects.add(rect)

        # Midpoint Rule
        midpoint_rects = VGroup()
        for i in range(3):
            x_start = i
            x_end = x_start + 1
            x_mid = (x_start + x_end) / 2
            rect = Rectangle(
                height=graph4.underlying_function(x_mid),
                width=1,
                color=YELLOW,
                fill_opacity=0.5
            )
            rect.move_to(axes3.c2p(x_mid, graph4.underlying_function(x_mid)/2))
            midpoint_rects.add(rect)

        left_label = Tex("Left Sum", color=RED, font_size=24).move_to(UP*2 + LEFT*3)
        right_label = Tex("Right Sum", color=BLUE, font_size=24).move_to(UP*2 + RIGHT*3)
        midpoint_label = Tex("Midpoint Rule", color=YELLOW, font_size=24).move_to(DOWN*2)

        self.play(Create(axes3), run_time=1)
        self.play(Create(graph4), run_time=1)
        self.play(FadeIn(left_rects), Write(left_label), run_time=1)
        self.wait(1)
        self.play(FadeIn(right_rects), Write(right_label), run_time=1)
        self.wait(1)
        self.play(FadeIn(midpoint_rects), Write(midpoint_label), run_time=1)
        self.wait(1)

        # Step 9: Explanation of Midpoint Rule accuracy
        self.clear()
        midpoint_explanation = Tex("For linear functions, Midpoint Rule gives exact integral value.\\\\For other functions, it's more accurate than Left/Right sums\\\\because positive and negative errors tend to cancel each other out.")
        midpoint_explanation.move_to(UP*1)
        self.play(Write(midpoint_explanation), run_time=3)
        self.wait(1)

        # Step 10: Summary
        self.clear()
        summary_title = Text("Key Takeaways", font_size=36).move_to(UP*3)
        summary = BulletedList(
            "Area between curves = Top function - Bottom function",
            "Definite integral = Limit of Riemann sums as n→∞",
            "Net area = Areas above x-axis - Areas below x-axis",
            "Total area = Sum of all areas (above + below x-axis)",
            "Midpoint Rule is more accurate than Left/Right sums",
            "Midpoint Rule is exact for linear functions",
            font_size=28
        ).move_to(UP*0.5)
        self.play(Write(summary_title), run_time=1)
        self.wait(0.5)
        self.play(Write(summary), run_time=4)
        self.wait(2)

        self.wait(1)