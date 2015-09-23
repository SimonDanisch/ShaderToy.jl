using ShaderToy, FileIO, GLAbstraction

shadertoy("clouds.frag", Dict{Symbol, Any}(
	:iChannel0 => Texture(load("tex16.png").data, x_repeat=:repeat, minfilter=:linear),
))
