module ShaderToy
using GeometryTypes, GLAbstraction, GLVisualize, ColorTypes, Reactive
using GLWindow, FileIO, ModernGL

function shadertoy(shaderpath, additional_uniforms::Dict{Symbol, Any}=Dict{Symbol, Any}(); templates=Dict{ASCIIString, ASCIIString}())
    @gen_defaults! additional_uniforms begin
        iResolution         = map(Vec2f0, screen.inputs[:framebuffer_size])
        iMouse              = filterwhen(map(isempty, screen.inputs[:mouse_buttons_pressed]), Vec2f0(0), map(Vec2f0, screen.inputs[:mouseposition]))
        iGlobalTime         = bounce(0f0:0.016f0:2000f0)
        preferred_camera    = :nothing
        primitive::GLMesh2D = SimpleRectangle(-1f0,-1f0,2f0,2f0)
    end
    templates = merge(templates, Dict("SHADERTOY_INPUTS" => """
    uniform vec2 iResolution;
    uniform vec2 iMouse;
    uniform float iGlobalTime;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform sampler2D iChannel2;
    uniform sampler2D iChannel3;
    """
    ))
    program = LazyShader(
        load(Pkg.dir("ShaderToy", "src", "fullscreen.vert")),
        load(Pkg.dir("ShaderToy", "src", "shadertoy.frag")),
        load(shaderpath),
        view=templates
    )
    robj = std_renderobject(additional_uniforms, program)
    view(robj)
    isinteractive() ? @async(renderloop(screen)) : renderloop(screen)
    robj
end
export shadertoy

function __init__()
	global screen
	screen = glscreen()
end

end # module
