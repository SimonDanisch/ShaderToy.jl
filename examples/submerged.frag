{{GLSL_VERSION}}

{{SHADERTOY_INPUTS}}

#define MODEL_JELLYFISH  0
#define MODEL_FISH       1
#define MODEL_GROUND     2

vec2 t;
float time;
float anim_offset = 0.0;
int model = 0;
mat3 rot, trot, rx;
float znear;
vec3 glow;
vec2 p;
float tm2;
vec2 ltc;
int material;

mat3 rotateYmat(float ang)
{
    return mat3(cos(ang), 0.0, sin(ang),
                0.0, 1.0, 0.0,
                -sin(ang), 0.0, cos(ang));
}

mat3 rotateXmat(float ang)
{
    return mat3(0.0, 0.0, 1.0,
                cos(ang), sin(ang), 0.0,
                -sin(ang), cos(ang), 0.0);
}

float traceSphere(vec3 ro, vec3 rd, float radsq)
{
    float a = dot(rd, rd);
    float b = dot(ro, rd);
    float c = dot(ro, ro) - radsq;
    float d = (b * b - a * c) * 4.0;

    return mix(1e4, (-b + sqrt(d)) / (2.0 * a), step(0.0, d));
}


vec3 tex(vec2 p)
{
    float su = 0.5 + 0.5 * cos(p.x * 4.0);
    vec3 c = mix(vec3(0.5, 0.1, 0.1) * 0.3, vec3(1.0, 0.9, 0.5), 1.0 - p.y + cos(time * 8.0) * 0.02);
    vec3 c2 = c * mix(vec3(1.0, 0.9, 0.5), vec3(0.7, 0.5, 0.1), su);
    return mix(c2, c, sqrt(1.0 - p.y)) + pow(su * (0.5 + 0.5 * cos(p.y * 40.0)) * 1.02, 64.0) * vec3(0.1);
}

float radius(float x)
{
    if(model == MODEL_JELLYFISH)
    {
        float t = time + anim_offset;
        return (x * 0.3 + (0.5 + 0.5 * cos(x * 4.0 + t * 10.0)) * 0.04);
    }
    
    if(model == MODEL_GROUND)
    {
        return x * 0.5;
    }
    
    return mix(x * 0.03, 1.0, 0.5 + 0.5 * sin(x * 0.8 - 0.6)) * 0.6;
}

float zpos(float x)
{
    if(model == MODEL_JELLYFISH)
    {
        float t = time + anim_offset;
        return cos(x * 0.5 + t) * 2.0 * (1.0 + iMouse.x / iResolution.x * 2.0);
    }
    
    if(model == MODEL_GROUND)
    {
        return cos(x / 8.0 * 3.14159 * 2.0 + 0.1);
    }
    
    return x * 0.4 + cos(x + time * 4.0) * 0.1;
}

void swap(inout float a, inout float b)
{
    float c = a;
    a = b;
    b = c;
}

void tubePiece(int j, vec3 ro, vec3 rd, inout vec2 tc, inout float tm)
{
    float s0 = radius(float(j)), s1 = radius(float(j + 1));
    float z0 = zpos(float(j)), z1 = zpos(float(j + 1));
    
    float zz0 = -z1;
    float f = z1 - z0;
    
    if(z0 < z1)
    {
        swap(s0, s1);
        swap(z0, z1);
    }
    
    float i = 0.0;
    vec3 oro = ro, ord = rd;
    

    float zd = z0 - z1;
    
    float u = (s1 - s0) / zd;
    
    float zofs = s0 / u;
    float rus = 1.0 / (u * u);
    
    ro.z += zofs + z0;
    
    float a = dot(rd.xy, rd.xy) * rus - rd.z * rd.z;
    float b = dot(ro.xy, rd.xy) * rus - rd.z * ro.z;
    float c = dot(ro.xy, ro.xy) * rus - ro.z * ro.z;
    float d = b * b - a * c;
    
    if(d < 0.0)
        return;
    
    d = sqrt(d);
    
    float cone_min = (-b - d) / a;
    float cone_max = (-b + d) / a;
    
    float rp0 = ro.z + rd.z * cone_min - zofs;
    float rp1 = ro.z + rd.z * cone_max - zofs;
    
    
    if(rp0 > 0.0 && rp0 < zd && cone_min > 0.0)
        i = cone_min;
    else if(rp1 > 0.0 && rp1 < zd && cone_max > 0.0)
        i = cone_max;
    else
        return;

        
    ro = oro;
    rd = ord;
    
    vec3 rp = ro + rd * i;
    float t = (rp.z - zz0) / f;
    
    vec2 ltc = vec2(atan(rp.y, rp.x) * 3.0, mix(float(j + 1), float(j), t));
    float hit = step(i, tm);
    
    tc = mix(tc, ltc, hit);
    tm = mix(tm, i, hit);
}


float tube(vec3 ro, vec3 rd, inout vec2 tc)
{
    float tm = 1e2;
    
    tubePiece(0, ro, rd, tc, tm);
    tubePiece(1, ro, rd, tc, tm);
    tubePiece(2, ro, rd, tc, tm);
    tubePiece(3, ro, rd, tc, tm);
    tubePiece(4, ro, rd, tc, tm);
    tubePiece(5, ro, rd, tc, tm);
    tubePiece(6, ro, rd, tc, tm);
    tubePiece(7, ro, rd, tc, tm);
    
    tc.y /= float(8);
    
    return tm;
}

vec3 backgtex(vec3 p)
{
    float f = clamp(smoothstep(8.0, 30.0, p.y), 0.0, 1.0);
    vec3 n = pow(smoothstep(10.0, 42.0, p.y), 100.0) * vec3(1.0, 0.9, 0.5);
    return (mix(vec3(0.1, 0.2, 0.2), vec3(0.0, 0.1, 0.1), 0.5 + 0.5 * cos(p.y * 0.4 + time * 10.0)) * 0.4 * f + n) * 0.5
        + vec3(0.05, 0.06, 0.1) * smoothstep(-40.0, 1.0, p.y);
}

float noise( vec2 x )
{
    return texture(iChannel0, x / 64.0).r;
}

mat3 transpose(mat3 m)
{
    return mat3(m[0].x, m[1].x, m[2].x,
                m[0].y, m[1].y, m[2].y,
                m[0].z, m[1].z, m[2].z);
}

    
void traceFish(int i, inout vec2 tc, inout float tm, vec3 ro, vec3 rd)
{
    mat3 r = rotateXmat(time + float(i) * 0.4 + cos(time + float(i))), trans_r = transpose(r);
    
    vec3 tr = rotateYmat(float(i)) * rotateXmat(float(i)) * vec3(0.0, float(i), float(i)) * 4.0 +
        r * vec3(0.0, 8.0, 0.0);
    
    vec3 vtr = trot * (tr - ro);
    
    if(vtr.z < -1e-3)
    {
        vec2 ptr = vtr.xy / vtr.z * znear;
        glow += vec3(0.3, 0.7, 1.0).bgr * pow(max(0.0, 1.0 - distance(ptr, p) * 1.0) * 5.0, 2.0) * 0.4;
    }
    
    anim_offset = float(i) * 1.7;
    
    vec3 s = vec3(1.0, 2.0, 1.0);
    
    tm2 = tube((trans_r * (ro - tr)) * s, (trans_r * rd) * s, ltc);
    
    tc = mix(tc, ltc, step(tm2, tm));
    tm = min(tm, tm2);
}

void traceJellyFish(int i, inout vec2 tc, inout float tm, vec3 ro, vec3 rd)
{
    mat3 r = rotateYmat(float(i) * 2.0) * rx, trans_r = transpose(r);
    vec3 tr = rotateYmat(float(i)) * vec3(float(i) * 1.0, sin(float(i) * 5.0) * 10.0, 4.0) *
        (1.0 + iMouse.y / iResolution.y * 2.0);
    
    vec3 vtr = trot * (tr - ro);
    
    if(vtr.z < -1e-3)
    {
        vec2 ptr = vtr.xy / vtr.z * znear;
        glow += vec3(0.3, 0.7, 1.0) * pow(max(0.0, 1.0 - distance(ptr, p) * 2.0) * 7.0, 2.0) *
            mix(0.7, 1.2, 0.5 + 0.5 * cos(float(i) + time * 4.0));
    }
    
    anim_offset = float(i) * 1.7;
    
    tm2 = tube(trans_r * (ro - tr), trans_r * rd, ltc);
    
    if(tm2 < tm)
        material = MODEL_JELLYFISH;
    
    tc = mix(tc, ltc, step(tm2, tm));
    tm = min(tm, tm2);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    t = uv * 2.0 - vec2(1.0);
    t.x *= iResolution.x / iResolution.y;
    
    time = iGlobalTime;
    
    material = MODEL_FISH;
    znear = -0.8;
    rot = rotateXmat(3.1415926 * 0.5 + cos(time * 0.1) + sin(time * 5.0) * 0.002) * rotateYmat(time * 0.2);
    trot = transpose(rot);
    
    p = t.xy;
    
    vec3 ro = rot * vec3(cos(time), sin(time * 0.3), 10.0);
    vec3 rd = rot * vec3(p, znear);
    float tm = 2e2;
    
    vec2 tc = vec2(0.0);
    
    glow = vec3(0.0);
    
    model = MODEL_FISH;
    for(int i = 0; i < 8; i += 1)
        traceFish(i, tc, tm, ro, rd);



    
    model = MODEL_JELLYFISH;
    rx = rotateXmat(3.1415926);
    
    for(int i = 0; i < 10; i += 1)
        traceJellyFish(i, tc, tm, ro, rd);

    
    // ground
    
    model = MODEL_GROUND;
    mat3 r = rotateXmat(-3.1415926), trans_r = transpose(r);
    vec3 tr = vec3(0.0, -24.0, 0.0);
    
    vec3 vtr = trot * (tr - ro);
    
    anim_offset = 1.7;
    
    vec3 s = vec3(0.2, 0.2, 0.2);
    
    tm2 = tube(trans_r * (ro - tr) * s, trans_r * rd * s, ltc);
    
    if(tm2 < tm)
        material = MODEL_GROUND;
    
    tc = mix(tc, ltc, step(tm2, tm));
    tm = min(tm, tm2);
    
    
    
    
    vec3 rp = ro + rd * tm;
    
    
    tm2 = traceSphere(ro, rd, 40.0 * 40.0);
    vec3 backgcol = backgtex(ro + rd * tm2);
    
    vec3 c;
    
    if(material == MODEL_FISH)
        c = tex(tc);
    
    if(material == MODEL_JELLYFISH)
        c = tex(tc).bgr;
    
    if(material == MODEL_GROUND)
        c = mix(0.3 * mix(vec3(0.5, 0.3, 0.3), vec3(1.0, 1.0, 0.4), mix(0.3, 0.5, noise(rp.xz * 8.0))),
                backgcol, pow(smoothstep(0.0, 1.0, tc.y * 1.0), 2.0)) * smoothstep(-10.0, 1.0, rp.y - -25.0);
    
    float v = pow(1.0 - smoothstep(0.0, 2.0, length(p)), 0.5);
    
    vec3 col = (mix(vec3(0.0), c, step(tm, 0.9e2))) * 1.1;
    
    float bs = clamp(1.0 - length(backgcol) * 4.0, 0.0, 1.0) * v * 3.5;
    
    fragColor.rgb = (mix(backgcol, col, step(tm, tm2)) + glow * 0.01) * v;
    fragColor.rgb += noise(fragCoord.xy) * 0.01;
    
    fragColor.rgb += smoothstep(0.9, 0.91,
                                   noise(t.xy * 40.0 + vec2(cos(time + t.y * 5.0) * 4.0, time * 10.0 + cos(time) * 5.0 + sin(time + t.x * 3.0) * 4.0) )) * 0.01 *
        smoothstep(0.0, 20.0, tm) * bs;
    
    fragColor.rgb += smoothstep(0.9, 0.91,
                                   noise(t.xy * 80.0 + vec2(cos(time + t.y * 10.0) * 4.0, time * 10.0 + cos(time + 0.1) * 5.0 + sin(time * 0.5 + t.x * 8.0) * 4.0) )) * 0.01 *
        smoothstep(0.0, 15.0, tm) * 2.0 * bs;

    fragColor.rgb = pow(fragColor.rgb, vec3(0.8));
    fragColor.a = 1.0;
}
