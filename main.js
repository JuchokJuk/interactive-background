import "pathseg";
import "matter-attractors";
import Matter from "matter-js";
import { app, backend, design, frontend, human, research } from "./shapes";


function runMatter() {

  // create engine
  const engine = Matter.Engine.create();

  engine.world.gravity.y = 0;
  engine.world.gravity.x = 0;
  engine.world.gravity.scale = 0;


  // create renderer

  const render = Matter.Render.create({
    element: canvas,
    engine: engine,
    options: {
      background: "#15171e",
      showVelocity: false,
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false
    }
  });


  // create runner
  const runner = Matter.Runner.create();


  // create a body with an attractor
  const attractiveBody = Matter.Bodies.circle(
    render.options.width / 2,
    render.options.height / 2,
    0,
    {
      isStatic: true,
      plugin: {
        attractors: [
          function (bodyA, bodyB) {
            return {
              x: (bodyA.position.x - bodyB.position.x) * 1e-4,
              y: (bodyA.position.y - bodyB.position.y) * 1e-4
            };
          }
        ]
      }
    }
  );

  Matter.World.add(engine.world, attractiveBody);


  // add some bodies that to be attracted
  const figures = [
    { element: app, texture: "images/app.svg" },
    { element: backend, texture: "images/backend.svg" },
    { element: design, texture: "images/design.svg" },
    { element: frontend, texture: "images/frontend.svg" },
    { element: research, texture: "images/research.svg" },
    { element: human, texture: "images/human.svg" },
  ];

  const stack = [];

  for (const figure of figures) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const angle = Matter.Common.random(0, 360);
    const r = Math.sqrt(w ** 2 + h ** 2)
    stack.push(
      Matter.Bodies.fromVertices(
        w / 2 + r * Math.cos(angle),
        h / 2 + r * Math.sin(angle),
        Matter.Svg.pathToVertices(figure.element.firstElementChild),
        {
          render: {
            rotate: Math.random(),
            sprite: {
              texture: figure.texture,
              xScale: 1,
              yScale: 1
            }
          }
        },
        true,
        0.01,
        30
      )
    );
  };

  for (const body of stack) {
    Matter.Body.setAngle(body, Math.random());
  };

  Matter.World.add(engine.world, stack);


  // add mouse control
  const mouse = Matter.Mouse.create(render.canvas);
  const mouseConstraint = Matter.MouseConstraint.create(
    engine,
    {
      mouse: mouse,
      constraint: {
        // allow bodies on mouse to rotate
        angularStiffness: 0.001,
        stiffness: 1,
        render: {
          visible: false
        }
      }
    }
  );

  mouseConstraint.mouse.element.removeEventListener(
    "mousewheel",
    mouseConstraint.mouse.mousewheel
  );
  mouseConstraint.mouse.element.removeEventListener(
    "DOMMouseScroll",
    mouseConstraint.mouse.mousewheel
  );

  Matter.World.add(engine.world, mouseConstraint);
  // keep the mouse in sync with rendering
  render.mouse = mouse;


  // run engine and render
  Matter.Runner.run(runner, engine);
  Matter.Render.run(render);


  // return a context for MatterDemo to control
  return {
    attractiveBody: attractiveBody,
    mouseConstraint: mouseConstraint,
    mouse: mouse,
    engine: engine,
    runner: runner,
    render: render,
    canvas: render.canvas,
    stop: function () {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    },
    play: function () {
      Matter.Runner.run(runner, engine);
      Matter.Render.run(render);
    }
  };
};

function setWindowSize() {
  matter.render.canvas.width = window.innerWidth;
  matter.render.canvas.height = window.innerHeight;
};

function resetGravityPoint(event) {
  Matter.Events.off(matter.engine, 'afterUpdate', matter.updateHandler);
  matter.mouseConstraint.mouse.mouseup(event);

  Matter.Body.setPosition(matter.attractiveBody, {
    x: matter.render.options.width / 2,
    y: matter.render.options.height / 2,
  });
}

function setGravityPoint() {
  Matter.Events.on(matter.engine, 'afterUpdate', updateHandler);
}

function updateHandler() {
  // smoothly move the attractor body towards the mouse
  Matter.Body.translate(matter.attractiveBody, {
    x: (matter.mouse.position.x - matter.attractiveBody.position.x) * 0.12,
    y: (matter.mouse.position.y - matter.attractiveBody.position.y) * 0.12
  });
}


Matter.use('matter-attractors');

const canvas = document.getElementById('interactive-background');

const matter = runMatter();

setWindowSize();

window.addEventListener('resize', setWindowSize, false);
canvas.addEventListener('mouseleave', resetGravityPoint, false);
canvas.addEventListener('mouseenter', setGravityPoint, false);