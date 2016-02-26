# ShaderToy

[![Build Status](https://travis-ci.org/SimonDanisch/ShaderToy.jl.svg?branch=master)](https://travis-ci.org/SimonDanisch/ShaderToy.jl)

This is [ShaderToy](https://www.shadertoy.com/) recreated with [GLVisualize.jl](https://github.com/JuliaGL/GLVisualize.jl) ,which means its all Julia + OpenGL.
It's a nice playground to get started with OpenGL.


[![](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/doc/clouds.gif?raw=true)](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/examples/clouds.frag)
[![](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/doc/monster.gif?raw=true)](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/examples/monster.frag)
[![](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/doc/seascape.gif?raw=true)](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/examples/seascape.frag)
[![](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/doc/raytracing.gif?raw=true)](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/examples/raytracing.frag)
[![](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/doc/submerged.gif?raw=true)](https://github.com/SimonDanisch/ShaderToy.jl/blob/master/examples/submerged.frag)


# Usage

just use this little code snipped to make your shader run:
```Julia
using ShaderToy
shadertoy("path_to_you_shader.frag")
```
Execute it in the REPL or via some editor.
In the shader you only need this:
```GLSL
{{GLSL_VERSION}}
{{SHADERTOY_INPUTS}} //includes shadertoy inputs

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	vec2 uv = fragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;    

	fragColor = vec4(uv,0,1); // write something to fragColor. 
	//Important: You need also to write to the alpha channel,which is not the case for shadertoy.com
}
```
The fun part is, that when you run `shadertoy` you can edit the shader code in any editor and the changes will be immediately visible.
You can also add arbitrary textures and uniforms like this:
```Julia
shadertoy("submerged.frag", Dict{Symbol, Any}(
	:iChannel0 => Texture(rand(Float32, 64,64), x_repeat=:repeat, minfilter=:linear),
	:myuniform => Vec3f0(0,1,0),
	:myanimated_uniform => bounce(0f0:0.001f0:50f0) # will bounce between 0 and 50 with a rate of 1/60 seconds
))
```

```GLSL
{{GLSL_VERSION}}
{{SHADERTOY_INPUTS}} //will include iChannel0
uniform vec3 myuniform;
uniform float myanimated_uniform; //voila, your data

```

If you migrate shader from ShaderToy, you also need to replace the function `texture2D` with `texture`.
That should be it, the rest is very similar to the shadertoy api:
It's just more flexible as you can do whatever you want with GLVisualize, GLAbstraction and Reactive.


# Installation
just execute:

```Julia
Pkg.clone("https://github.com/SimonDanisch/ShaderToy.jl.git")
```

