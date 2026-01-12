from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Title
        title = Text("Estimating Area Between Curves", font_size=36)
        title.move_to(UP*3)
        self.play(Write(title))
        self.wait(1)

        # Step 2: Show curves and region
        axes = Axes(
            x_range=[-3, 2, 1],
            y_range=[-1, 3, 1],
            axis_config={"color": BLUE},
        )
        axes.move_to(DOWN*0.5)

        # Plot y = x^2
        parabola = axes.plot(lambda x: x**2, color=RED)
        parabola_label = MathTex("y = x^2", color=RED).next_to(parabola, UP, buff=0.1)

        # Plot y = 2 - x
        line = axes.plot(lambda x: 2 - x, color=GREEN)
        line_label = MathTex("y = 2 - x", color=GREEN).next_to(line, UP, buff=0.1)

        self.play(Create(axes))
        self.play(Create(parabola), Write(parabola_label))
        self.play(Create(line), Write(line_label))
        self.wait(1)

        # Step 3: Show intersection points with verification
        dot1 = Dot(axes.c2p(-2, 4), color=YELLOW)
        dot2 = Dot(axes.c2p(1, 1), color=YELLOW)
        intersection_text = Tex("Intersection points at x=-2 and x=1", "\\\\",
                              "Found by solving x² = 2 - x", "\\\\",
                              "x² + x - 2 = 0 → (x+2)(x-1) = 0").move_to(DOWN*2.5)

        self.play(FadeIn(dot1), FadeIn(dot2), Write(intersection_text))
        self.wait(1)

        # Step 4: Show height formula with explanation
        height_formula = MathTex("(2 - x) - x^2", color=PURPLE).move_to(UP*1.5)
        height_text = Tex("Height = Upper curve - Lower curve").next_to(height_formula, UP)

        self.play(Write(height_text), Write(height_formula))
        self.wait(1)

        # Step 5: Riemann sum approximation with transition to integral
        n = 5
        dx = 3 / n
        rectangles = VGroup()
        for i in range(n):
            x_left = -2 + i * dx
            x_right = x_left + dx
            height = (2 - x_left) - x_left**2
            rectangle = Rectangle(
                height=height,
                width=dx,
                fill_color=BLUE,
                fill_opacity=0.5,
                stroke_color=WHITE
            )
            rectangle.move_to(axes.c2p(x_left + dx/2, height/2))
            rectangles.add(rectangle)

        riemann_text = Tex("Riemann Sum Approximation", "\\\\",
                          "Width of each rectangle (ΔX) = (1 - (-2)) / n = 3/n", "\\\\",
                          "As n → ∞, this becomes the definite integral").move_to(DOWN*3)

        self.play(Create(rectangles), Write(riemann_text))
        self.wait(1)

        # Step 6: Definite integral with explanation
        integral = MathTex(
            "\\int_{-2}^{1} \\left[ (2 - x) - x^2 \\right] dx",
            color=GOLD
        ).move_to(DOWN*2)
        integral_explanation = Tex("This gives the exact area between the curves").next_to(integral, DOWN)

        self.play(Transform(riemann_text, integral))
        self.play(Write(integral_explanation))
        self.wait(1)

        # Step 7: Negative integral values with detailed explanation
        self.clear()
        new_axes = Axes(
            x_range=[-2, 2, 1],
            y_range=[-2, 2, 1],
            axis_config={"color": BLUE},
        )
        new_axes.move_to(ORIGIN)

        # Create a curve that goes above and below x-axis
        curve = new_axes.plot(lambda x: np.sin(x*2), color=RED)
        curve_label = Tex("F(t) with positive and negative areas").move_to(UP*3)

        self.play(Create(new_axes), Create(curve), Write(curve_label))
        self.wait(1)

        # Show positive and negative areas with labels
        pos_area = new_axes.get_area(curve, x_range=[0, 1], color=GREEN)
        neg_area = new_axes.get_area(curve, x_range=[1, 2], color=RED)

        area_text = Tex("Positive area (above x-axis)", "\\\\",
                       "Contributes + to integral").next_to(pos_area, UP)
        neg_area_text = Tex("Negative area (below x-axis)", "\\\\",
                           "Contributes - to integral", "\\\\",
                           "Total integral = Positive areas - Negative areas").next_to(neg_area, DOWN)

        self.play(FadeIn(pos_area), Write(area_text))
        self.play(FadeIn(neg_area), Write(neg_area_text))
        self.wait(1)

        # Step 8: Midpoint Rule introduction with comparison
        self.clear()
        midpoint_title = Text("Midpoint Rule", font_size=36).move_to(UP*3)
        comparison = Tex("More accurate than Left/Right Riemann sums", "\\\\",
                        "Uses midpoint of each subinterval", "\\\\",
                        "Errors cancel out for better approximation", "\\\\",
                        "For linear functions, Midpoint Rule is exact", "\\\\",
                        "Because the function is symmetric around midpoints").move_to(UP*2)

        self.play(Write(midpoint_title), Write(comparison))
        self.wait(1)

        # Show linear function where midpoint is exact
        linear_axes = Axes(
            x_range=[0, 4, 1],
            y_range=[0, 4, 1],
            axis_config={"color": BLUE},
        )
        linear_axes.move_to(DOWN)

        linear_func = linear_axes.plot(lambda x: x, color=GREEN)
        linear_label = Tex("Linear function: Midpoint Rule is exact", "\\\\",
                          "Because the function is symmetric around midpoints").next_to(linear_func, UP)

        # Add midpoint rectangles
        n_mid = 4
        mid_rectangles = VGroup()
        for i in range(n_mid):
            x_left = i
            x_right = x_left + 1
            x_mid = (x_left + x_right)/2
            height = x_mid
            rectangle = Rectangle(
                height=height,
                width=1,
                fill_color=PURPLE,
                fill_opacity=0.5,
                stroke_color=WHITE
            )
            rectangle.move_to(linear_axes.c2p(x_mid, height/2))
            mid_rectangles.add(rectangle)

        self.play(Create(linear_axes), Create(linear_func), Write(linear_label))
        self.play(Create(mid_rectangles))
        self.wait(2)

        # Step 9: Side-by-side comparison of Riemann sums
        self.clear()
        comparison_title = Text("Comparison of Approximation Methods", font_size=36).move_to(UP*3)

        # Left Riemann Sum
        left_axes = Axes(
            x_range=[0, 4, 1],
            y_range=[0, 4, 1],
            axis_config={"color": BLUE},
        ).scale(0.7).move_to(LEFT*2 + UP)

        left_func = left_axes.plot(lambda x: x**2, color=RED)
        left_rectangles = VGroup()
        for i in range(4):
            x_left = i
            height = x_left**2
            rectangle = Rectangle(
                height=height,
                width=1,
                fill_color=BLUE,
                fill_opacity=0.5,
                stroke_color=WHITE
            ).scale(0.7).move_to(left_axes.c2p(x_left + 0.5, height/2))
            left_rectangles.add(rectangle)

        left_label = Tex("Left Riemann Sum", "\\\\",
                        "Uses left endpoint height", "\\\\",
                        "Underestimates for increasing functions").next_to(left_axes, UP)

        # Right Riemann Sum
        right_axes = Axes(
            x_range=[0, 4, 1],
            y_range=[0, 4, 1],
            axis_config={"color": BLUE},
        ).scale(0.7).move_to(RIGHT*2 + UP)

        right_func = right_axes.plot(lambda x: x**2, color=RED)
        right_rectangles = VGroup()
        for i in range(4):
            x_right = i + 1
            height = x_right**2
            rectangle = Rectangle(
                height=height,
                width=1,
                fill_color=BLUE,
                fill_opacity=0.5,
                stroke_color=WHITE
            ).scale(0.7).move_to(right_axes.c2p(x_right - 0.5, height/2))
            right_rectangles.add(rectangle)

        right_label = Tex("Right Riemann Sum", "\\\\",
                         "Uses right endpoint height", "\\\\",
                         "Overestimates for increasing functions").next_to(right_axes, UP)

        # Midpoint Riemann Sum
        mid_axes = Axes(
            x_range=[0, 4, 1],
            y_range=[0, 4, 1],
            axis_config={"color": BLUE},
        ).scale(0.7).move_to(DOWN*1.5)

        mid_func = mid_axes.plot(lambda x: x**2, color=RED)
        mid_rectangles = VGroup()
        for i in range(4):
            x_mid = i + 0.5
            height = x_mid**2
            rectangle = Rectangle(
                height=height,
                width=1,
                fill_color=PURPLE,
                fill_opacity=0.5,
                stroke_color=WHITE
            ).scale(0.7).move_to(mid_axes.c2p(x_mid, height/2))
            mid_rectangles.add(rectangle)

        mid_label = Tex("Midpoint Riemann Sum", "\\\\",
                       "Uses midpoint height", "\\\\",
                       "Most accurate for general functions", "\\\\",
                       "Errors cancel out better than Left/Right").next_to(mid_axes, UP)

        self.play(Write(comparison_title))
        self.play(Create(left_axes), Create(left_func), Create(left_rectangles), Write(left_label))
        self.play(Create(right_axes), Create(right_func), Create(right_rectangles), Write(right_label))
        self.play(Create(mid_axes), Create(mid_func), Create(mid_rectangles), Write(mid_label))
        self.wait(2)

        # Final summary
        summary = Tex("Key Takeaways:", "\\\\",
                     "1. Area between curves = ∫(upper - lower)dx", "\\\\",
                     "2. Negative areas below x-axis contribute negatively", "\\\\",
                     "3. Midpoint Rule uses midpoint heights", "\\\\",
                     "4. For linear functions, Midpoint Rule is exact", "\\\\",
                     "5. Midpoint Rule generally more accurate than Left/Right", "\\\\",
                     "6. Width of rectangles (ΔX) = (b - a)/n").move_to(ORIGIN)

        self.clear()
        self.play(Write(summary))
        self.wait(3)