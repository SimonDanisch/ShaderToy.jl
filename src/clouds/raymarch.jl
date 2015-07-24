using GeometryTypes
using GLAbstraction, GLVisualize, ColorTypes, Reactive, FileIO, ImageIO, ModernGL

screen 	= GLVisualize.ROOT_SCREEN

texparams = [
    (GL_TEXTURE_WRAP_S,  GL_REPEAT),
    (GL_TEXTURE_WRAP_T,  GL_REPEAT ),
    (GL_TEXTURE_MIN_FILTER, GL_LINEAR),
    (GL_TEXTURE_MAG_FILTER, GL_LINEAR)
]

data = merge(Dict(
	:iResolution => lift(Vec2, screen.inputs[:framebuffer_size]),
	:iMouse 	 => dropwhen(lift(isempty, screen.inputs[:mousebuttonspressed]), Vec2(0), lift(Vec2, screen.inputs[:mouseposition])),
	:iGlobalTime => bounce(0f0:0.016f0:2000f0),
	:iChannel0 	 => Texture(read(file"tex16.png").data, parameters=texparams),
	:preferred_camera => :nothing
), collect_for_gl(GLMesh2D(Rectangle{Float32}(-1f0,-1f0,2f0,2f0))))

program = TemplateProgram(File("..","fullscreen.vert"), file"raymarch.frag", File("..","shadertoy.frag"))
robj 	= std_renderobject(data, program)

view(robj)

renderloop()