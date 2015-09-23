using ShaderToy, GLAbstraction, FileIO, ColorTypes
shadertoy("submerged.frag", Dict{Symbol, Any}(
	:iChannel0 => Texture(rand(Float32, 64,64), x_repeat=:repeat, minfilter=:linear),
))
