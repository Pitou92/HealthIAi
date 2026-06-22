import os
import logging
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

logger = logging.getLogger(__name__)

def setup_telemetry(app: FastAPI):
    # 1. Prometheus Metrics Instrumentation
    try:
        # Patch Prometheus routing to fix AttributeError with _IncludedRouter in FastAPI 0.137.0+
        try:
            import prometheus_fastapi_instrumentator.routing as prometheus_routing
            from starlette.routing import Match, Mount

            def patched_prometheus_get_route_name(scope, routes, route_name=None):
                for route in routes:
                    try:
                        match, child_scope = route.matches(scope)
                    except Exception:
                        continue
                        
                    if match == Match.FULL:
                        try:
                            r_path = route.path
                        except AttributeError:
                            r_path = getattr(route, "path_format", scope.get("path", ""))
                        
                        route_name = r_path
                        child_scope = {**scope, **child_scope}
                        if isinstance(route, Mount) and route.routes:
                            child_route_name = patched_prometheus_get_route_name(child_scope, route.routes, route_name)
                            if child_route_name is None:
                                route_name = None
                            else:
                                route_name += child_route_name
                        return route_name
                    elif match == Match.PARTIAL and route_name is None:
                        try:
                            r_path = route.path
                        except AttributeError:
                            r_path = getattr(route, "path_format", scope.get("path", ""))
                        route_name = r_path
                return None

            prometheus_routing._get_route_name = patched_prometheus_get_route_name
            logger.info("Monkey-patched prometheus_fastapi_instrumentator.routing._get_route_name for FastAPI 0.137+ compatibility.")
        except Exception as prometheus_patch_err:
            logger.warning(f"Failed to monkey-patch Prometheus route details: {prometheus_patch_err}")

        Instrumentator().instrument(app).expose(app)
        logger.info("Prometheus metrics instrumented and exposed at /metrics")
    except Exception as e:
        logger.error(f"Failed to initialize Prometheus instrumentation: {e}")

    # 2. OpenTelemetry Tracing Instrumentation
    # Enable tracing by default, can be disabled via environment variable
    if os.getenv("ENABLE_TRACING", "true").lower() == "true":
        try:
            from opentelemetry import trace
            from opentelemetry.sdk.trace import TracerProvider
            from opentelemetry.sdk.trace.export import BatchSpanProcessor
            from opentelemetry.sdk.resources import Resource
            from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
            from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

            service_name = os.getenv("OTEL_SERVICE_NAME", "healthiai-backend")
            tempo_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://tempo:4317")

            resource = Resource(attributes={"service.name": service_name})
            provider = TracerProvider(resource=resource)
            
            # Configure OTLP exporter to connect to Tempo
            otlp_exporter = OTLPSpanExporter(endpoint=tempo_endpoint, insecure=True)
            processor = BatchSpanProcessor(otlp_exporter)
            provider.add_span_processor(processor)
            trace.set_tracer_provider(provider)

            # Monkey-patch opentelemetry-instrumentation-fastapi to fix AttributeError with _IncludedRouter in FastAPI 0.137.0+
            try:
                import opentelemetry.instrumentation.fastapi as otel_fastapi
                from starlette.routing import Match, Route

                def patched_get_route_details(scope):
                    app = scope.get("app")
                    if not app:
                        return scope.get("path")
                    route = None
                    for starlette_route in app.routes:
                        try:
                            match, _ = (
                                Route.matches(starlette_route, scope)
                                if isinstance(starlette_route, Route)
                                else starlette_route.matches(scope)
                            )
                        except Exception:
                            continue
                        if match == Match.FULL:
                            try:
                                route = starlette_route.path
                            except AttributeError:
                                route = scope.get("path")
                            break
                        if match == Match.PARTIAL:
                            try:
                                route = starlette_route.path
                            except AttributeError:
                                route = getattr(starlette_route, "path_format", scope.get("path"))
                    return route

                otel_fastapi._get_route_details = patched_get_route_details
                logger.info("Monkey-patched opentelemetry.instrumentation.fastapi._get_route_details for FastAPI 0.137+ compatibility.")
            except Exception as patch_err:
                logger.warning(f"Failed to monkey-patch OpenTelemetry route details: {patch_err}")

            # Instrument the FastAPI app
            FastAPIInstrumentor.instrument_app(app)
            logger.info(f"OpenTelemetry tracing instrumented successfully. Exporting to {tempo_endpoint}")
        except Exception as e:
            logger.warning(f"Could not initialize OpenTelemetry tracing: {e}. Running without traces.")
