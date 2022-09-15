import * as THREE from "three";
import React, { Suspense, useRef, useState } from "react";
import {
    ContactShadows,
    Environment,
    PerspectiveCamera,
    MeshDistortMaterial
} from "@react-three/drei";
import { useSpring } from "@react-spring/core";
import { a } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";

const AnimatedMaterial = a(MeshDistortMaterial);
export default function Scene({ setBg }) {
    // todo create ref for stone and light
    const sphere = useRef();
    const light = useRef();
    const [mode, setMode] = useState(false);
    const [down, setDown] = useState(false);

    const [hovered, setHovered] = useState(false);

    const [{ wobble, coat, color, ambient, env }] = useSpring(
        {
            wobble: down ? 1.2 : hovered ? 1.05 : 1,
            coat: mode && !hovered ? 0.04 : 1,
            ambient: mode && !hovered ? 1.5 : 0.5,
            env: mode && !hovered ? 0.4 : 1,
            color: hovered ? "#E8B059" : mode ? "#202020" : "white",
            config: (n) =>
                n === "wobble" && hovered && { mass: 2, tension: 1000, friction: 10 }
        },
        [mode, hovered, down]
    );

    useFrame((state) => {
        light.current.position.x = state.mouse.x * 20;
        light.current.position.y = state.mouse.y * 20;
        if (sphere.current) {
            sphere.current.position.x = THREE.MathUtils.lerp(
                sphere.current.position.x,
                hovered ? state.mouse.x / 2 : 0,
                0.2
            );
            sphere.current.position.y = THREE.MathUtils.lerp(
                sphere.current.position.y,
                Math.sin(state.clock.elapsedTime / 1.5) / 6 +
                (hovered ? state.mouse.y / 2 : 0),
                0.2
            );
        }
    });
    return (
        <>
            <PerspectiveCamera makeDefault fov={75} position={[0, 0, 4]}>
                <a.ambientLight intensity={ambient} />
                <a.pointLight
                    ref={light}
                    position-z={-15}
                    intensity={env}
                    color="#F8C069"
                />
            </PerspectiveCamera>
            <Suspense fallback={null}>
                <a.mesh
                    ref={sphere}
                    scale={wobble}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    onPointerDown={() => setDown(true)}
                    onPointerUp={() => {
                        setDown(false);
                        setMode(!mode);
                        setBg({
                            background: !mode ? "#202020" : "#f0f0f0",
                            fill: !mode ? "#f0f0f0" : "#202020"
                        });
                    }}
                >
                    <sphereBufferGeometry args={[1, 64, 64]} />
                    <AnimatedMaterial
                        color={color}
                        envMapIntensity={env}
                        clearcoat={coat}
                        clearcoatRoughness={0}
                        metalness={0.7}
                    />
                </a.mesh>
                <Environment preset="warehouse" />
                <ContactShadows
                    rotation={[Math.PI / 2, 0, 0]}
                    position={[0, -1.6, 0]}
                    opacity={0.4}
                    width={15}
                    height={15}
                    blur={2.5}
                    far={1.6}
                />
            </Suspense>
        </>
    );
}
