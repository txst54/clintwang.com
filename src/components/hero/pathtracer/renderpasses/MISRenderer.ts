// MIS Path Tracer Renderer

import {BaseRenderer} from "@/components/hero/pathtracer/renderpasses/BaseRenderer";
import {PathTracer} from "@/components/hero/pathtracer/pathtracer";
import {RenderPass} from "@/lib/webglutils/RenderPass";
import {
    denoiserFSText, drawPassFSText,
    pathTracerFSText,
    pathTracerVSText,
    temporalAAFSText
} from "@/components/hero/pathtracer/shaders";

export default class MISRenderer extends BaseRenderer {
    private taa_c_read_idx: number = 2;
    private pt_frameBuffer: WebGLFramebuffer = this.gl.createFramebuffer();

    protected initialize(pathTracer: PathTracer): void {
        const type = this.gl.getExtension('OES_texture_float') ? this.gl.FLOAT : this.gl.UNSIGNED_BYTE;
        this.pt_frameBuffer = this.gl.createFramebuffer();
        // this.dn_frameBuffer = this.gl.createFramebuffer();
        // this.taa_frameBuffer = this.gl.createFramebuffer();
        // 0 color | 1 normal | 2 taa_c_1 | 3 taa_c_2 | 4 dn_c | null color
        this.textureConfig = this.createTextureConfig(5, type);

        this.renderPasses.pathTracer = new RenderPass(this.gl, pathTracerVSText, pathTracerFSText);
        this.renderPasses.denoiser = new RenderPass(this.gl, pathTracerVSText, denoiserFSText);
        this.renderPasses.temporalAA = new RenderPass(this.gl, pathTracerVSText, temporalAAFSText);
        this.renderPasses.drawPass = new RenderPass(this.gl, pathTracerVSText, drawPassFSText);
        this.setupPathTracerPass(pathTracer);
        this.setupDenoiserPass(pathTracer);
        this.setupTemporalAAPass(pathTracer);
        this.setupDrawPass(pathTracer);
    }

    private setupPathTracerPass(pathTracer: PathTracer): void {
        const numIndices = this.setupRayRenderPass(this.renderPasses.pathTracer, pathTracer);
        this.renderPasses.pathTracer.addUniform("uMouse", (gl, loc) => {
            gl.uniform2f(loc, pathTracer.getMouse().x, pathTracer.getMouse().y);
        });
        this.renderPasses.pathTracer.setDrawData(this.gl.TRIANGLES, numIndices, this.gl.UNSIGNED_SHORT, 0);
        this.renderPasses.pathTracer.setup();
    }

    private setupDrawPass(pathTracer: PathTracer): void {
        const taa_c_write_idx = this.taa_c_read_idx === 2 ? 3 : 2;
        const numIndices = this.setupRayRenderPass(this.renderPasses.drawPass, pathTracer);
        if (this.textureConfig && "textures" in this.textureConfig) {
            let textures = [this.textureConfig.textures[0]];
            this.renderPasses.drawPass.addUniform(`uTexture`, (gl, loc) => {
                gl.activeTexture(gl.TEXTURE0);
                if (this.textureConfig && "textures" in this.textureConfig) {
                    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
                }
                gl.uniform1i(loc, 0);
            });
            this.renderPasses.drawPass.setDrawData(this.gl.TRIANGLES, numIndices, this.gl.UNSIGNED_SHORT, 0);
            this.renderPasses.drawPass.setup();
        }
    }

    private setupDenoiserPass(pathTracer: PathTracer): void {
        const numIndices = this.setupRayRenderPass(this.renderPasses.denoiser, pathTracer);
        if (this.textureConfig && "textures" in this.textureConfig) {
            let textures = [this.textureConfig.textures[0], this.textureConfig.textures[1]];
            for (let i = 0; !(this.textureConfig) || i < this.textureConfig.count; i++) {
                this.renderPasses.denoiser.addUniform(`iChannel${i}`, (gl, loc) => {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    if (this.textureConfig && "textures" in this.textureConfig) {
                        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
                    }
                    gl.uniform1i(loc, i);
                });
            }
            this.renderPasses.denoiser.setDrawData(this.gl.TRIANGLES, numIndices, this.gl.UNSIGNED_SHORT, 0);
            this.renderPasses.denoiser.setup();
        }
    }

    private setupTemporalAAPass(pathTracer: PathTracer): void {
        const numIndices = this.setupRayRenderPass(this.renderPasses.temporalAA, pathTracer);
        if (this.textureConfig && "textures" in this.textureConfig) {
            let textures = [this.textureConfig.textures[4], this.textureConfig.textures[this.taa_c_read_idx]];
            for (let i = 0; !(this.textureConfig) || i < this.textureConfig.count; i++) {
                this.renderPasses.temporalAA.addUniform(`iChannel${i}`, (gl, loc) => {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    if (this.textureConfig && "textures" in this.textureConfig) {
                        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
                    }
                    gl.uniform1i(loc, i);
                });
            }
            this.renderPasses.temporalAA.setDrawData(this.gl.TRIANGLES, numIndices, this.gl.UNSIGNED_SHORT, 0);
            this.renderPasses.temporalAA.setup();
        }
    }

    public render(): void {
        if(this.pt_frameBuffer) {
            const gl = this.gl as WebGL2RenderingContext;
            const taa_c_write_idx = this.taa_c_read_idx === 2 ? 3 : 2;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.pt_frameBuffer);
            if (this.textureConfig && "textures" in this.textureConfig) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureConfig.textures[0], 0);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.textureConfig.textures[1], 0);
            }
            this.renderPasses.pathTracer.draw();
            //
            // gl.bindFramebuffer(gl.FRAMEBUFFER, this.dn_frameBuffer);
            // if ("textures" in this.textureConfig) {
            //     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureConfig.textures[4], 0);
            // }
            // this.renderPasses.denoiser.draw();
            //
            // gl.bindFramebuffer(gl.FRAMEBUFFER, this.taa_frameBuffer);
            // if ("textures" in this.textureConfig) {
            //     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureConfig.textures[taa_c_write_idx], 0);
            // }
            // this.renderPasses.temporalAA.draw();

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.renderPasses.drawPass.draw();
            this.taa_c_read_idx = taa_c_write_idx;
        }
    }
}