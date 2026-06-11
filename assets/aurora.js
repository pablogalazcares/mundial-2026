/* Fondo "aurora" WebGL reactivo al cursor (Fase 2). WebGL CRUDO (sin librerías ni CDN):
   un triángulo fullscreen con un fragment shader (3 centros de color que orbitan + glow que
   sigue el mouse). Fallback: en móvil o con prefers-reduced-motion no se carga (queda la aurora
   estática del CSS). Performance: dpr capado, ~40fps, se pausa con la pestaña oculta. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 760px)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'fx-aurora';
  var gl = canvas.getContext('webgl', { antialias: false, depth: false, stencil: false, alpha: false, powerPreference: 'low-power' })
        || canvas.getContext('experimental-webgl');
  if (!gl) return;                                   /* sin WebGL → queda el fallback CSS */
  document.body.prepend(canvas);
  document.body.classList.add('aurora-on');

  var vsrc = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  var fsrc = [
    'precision highp float;',
    'uniform float uTime; uniform vec2 uMouse; uniform vec2 uRes;',
    'uniform vec3 uC1,uC2,uC3,uCM;',
    'float blob(vec2 uv, vec2 c, float r){ vec2 d=(uv-c)*vec2(uRes.x/uRes.y,1.0); return smoothstep(r,0.0,length(d)); }',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy/uRes; uv.y = 1.0-uv.y;',
    '  float t = uTime;',
    '  vec3 col = vec3(0.017,0.018,0.022);',           /* base CASI NEGRA (linea editorial del Mundial) */
    '  vec2 c1=vec2(0.20+0.08*sin(t*0.7),0.18+0.06*cos(t*0.5));',
    '  vec2 c2=vec2(0.85+0.06*cos(t*0.6),0.06+0.05*sin(t*0.8));',
    '  vec2 c3=vec2(0.50+0.10*sin(t*0.4),0.98+0.05*cos(t*0.6));',
    '  col += uC1*blob(uv,c1,0.36)*0.12;',             /* azul (USA) muy sutil: el negro domina */
    '  col += uC2*blob(uv,c2,0.38)*0.13;',
    '  col += uC3*blob(uv,c3,0.42)*0.11;',
    '  col += uCM*blob(uv,uMouse,0.24)*0.30;',         /* glow dorado del cursor: el unico acento vivo */
    '  gl_FragColor = vec4(col,1.0);',
    '}'
  ].join('\n');

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vsrc));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fsrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); document.body.classList.remove('aurora-on'); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);  /* triángulo grande */
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uTime = gl.getUniformLocation(prog, 'uTime'), uMouse = gl.getUniformLocation(prog, 'uMouse'), uRes = gl.getUniformLocation(prog, 'uRes');
  var uC1 = gl.getUniformLocation(prog, 'uC1'), uC2 = gl.getUniformLocation(prog, 'uC2'),
      uC3 = gl.getUniformLocation(prog, 'uC3'), uCM = gl.getUniformLocation(prog, 'uCM');
  /* Mundial 26: 3 sedes sutiles (USA azul / CAN rojo / MEX verde) sobre negro + glow DORADO al cursor */
  var C = { 1: [0.18, 0.42, 0.95], 2: [0.90, 0.26, 0.30], 3: [0.10, 0.75, 0.42], m: [1.00, 0.80, 0.32] };
  window.AURORA_SET = function (c1, c2, c3, cm) { if (c1) C[1] = c1; if (c2) C[2] = c2; if (c3) C[3] = c3; if (cm) C.m = cm; };

  var dpr = Math.min(1.5, devicePixelRatio || 1);
  function resize() {
    canvas.width = Math.floor(innerWidth * dpr); canvas.height = Math.floor(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  addEventListener('resize', resize); resize();

  var tx = 0.5, ty = 0.25, mx = 0.5, my = 0.75;
  if (!matchMedia('(pointer: coarse)').matches)
    addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; }, { passive: true });

  var last = 0, raf = 0; var fps = 40;
  function frame(t) {
    if (t - last > 1000 / fps) {
      mx += (tx - mx) * 0.06; my += ((1 - ty) - my) * 0.06;
      gl.uniform2f(uMouse, mx, my); gl.uniform1f(uTime, t * 0.0003);
      gl.uniform3f(uC1, C[1][0], C[1][1], C[1][2]); gl.uniform3f(uC2, C[2][0], C[2][1], C[2][2]);
      gl.uniform3f(uC3, C[3][0], C[3][1], C[3][2]); gl.uniform3f(uCM, C.m[0], C.m[1], C.m[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3); last = t;
    }
    if (!document.hidden) raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } });
  raf = requestAnimationFrame(frame);
})();
