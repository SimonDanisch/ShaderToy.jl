using GeometryTypes
sleep(0.1)
using GLAbstraction, GLVisualize, ColorTypes, Reactive, FileIO, ImageIO, ModernGL

screen 	= GLVisualize.ROOT_SCREEN

data 	= merge(Dict(
	:iResolution 	  => lift(Vec2, screen.inputs[:framebuffer_size]),
	:iMouse 	 	  => dropwhen(lift(isempty, screen.inputs[:mousebuttonspressed]), Vec2(0), lift(Vec2, screen.inputs[:mouseposition])),
	:iGlobalTime 	  => bounce(0f0:0.016f0:2000f0),
	:preferred_camera => :nothing
), collect_for_gl(GLMesh2D(Rectangle{Float32}(-1f0,-1f0,2f0,2f0))))

program = TemplateProgram(file"..//fullscreen.vert", file"..//shadertoy.frag", file"rayprimitive.frag")
robj 	= std_renderobject(data, program)

view(robj)

renderloop()