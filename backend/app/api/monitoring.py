from fastapi import APIRouter, Depends, HTTPException, Header
from app.api.core.firebase_admin import get_current_user_from_auth_header
from app.api.core.supabase import supabase
from typing import Dict, Any
from datetime import datetime, timedelta
import psutil
import time
import logging

router = APIRouter()

# Global variables to track system metrics
start_time = time.time()
request_count = 0
error_count = 0

logger = logging.getLogger(__name__)

def is_admin_user(user: Dict[str, Any]) -> bool:
    """Check if user has admin privileges"""
    admin_emails = ["admin@legalai.com", "tanma@example.com"]
    return user.get("email") in admin_emails

@router.get("/health")
def get_system_health(authorization: str | None = Header(None)):
    """Get comprehensive system health metrics - Admin only"""
    user = get_current_user_from_auth_header(authorization)
    
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # System uptime
        current_time = time.time()
        uptime_seconds = current_time - start_time
        uptime_hours = uptime_seconds / 3600
        uptime_percentage = min(99.99, (uptime_hours / (24 * 7)) * 100)  # Week-based uptime
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        
        # CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_usage = (disk.used / disk.total) * 100
        
        # Error rate calculation
        error_rate = (error_count / max(request_count, 1)) * 100
        
        # Mock response time (in production, use actual metrics)
        response_time = 150.0  # milliseconds
        
        # Database connections (mock for now)
        db_connections = 25
        
        # Determine overall health status
        status = "healthy"
        if memory_usage > 80 or cpu_usage > 80 or error_rate > 5:
            status = "warning"
        if memory_usage > 95 or cpu_usage > 95 or error_rate > 10:
            status = "critical"
        
        return {
            "status": status,
            "timestamp": datetime.utcnow().isoformat(),
            "uptime": uptime_percentage,
            "responseTime": response_time,
            "errorRate": error_rate,
            "dbConnections": db_connections,
            "memoryUsage": memory_usage,
            "cpuUsage": cpu_usage,
            "diskUsage": disk_usage,
            "requestCount": request_count,
            "errorCount": error_count
        }
        
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching system health: {str(e)}")

@router.get("/metrics")
def get_detailed_metrics(authorization: str | None = Header(None)):
    """Get detailed system metrics and performance data - Admin only"""
    user = get_current_user_from_auth_header(authorization)
    
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # System information
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        
        # Network I/O
        net_io = psutil.net_io_counters()
        
        # Process information
        process_count = len(psutil.pids())
        
        # Load average (Unix systems)
        try:
            load_avg = psutil.getloadavg()
        except AttributeError:
            # Windows doesn't have load average
            load_avg = [0, 0, 0]
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "system": {
                "bootTime": boot_time.isoformat(),
                "processCount": process_count,
                "loadAverage": list(load_avg)
            },
            "network": {
                "bytesSent": net_io.bytes_sent,
                "bytesReceived": net_io.bytes_recv,
                "packetsSent": net_io.packets_sent,
                "packetsReceived": net_io.packets_recv
            },
            "performance": {
                "requestsPerMinute": request_count,
                "averageResponseTime": 150.0,
                "throughput": "1.2 MB/s"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting detailed metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching metrics: {str(e)}")

@router.get("/logs")
def get_system_logs(
    limit: int = 100,
    level: str = "INFO",
    authorization: str | None = Header(None)
):
    """Get recent system logs - Admin only"""
    user = get_current_user_from_auth_header(authorization)
    
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # This would normally read from log files or a logging system
        # For now, return mock log entries
        mock_logs = []
        levels = ["INFO", "WARNING", "ERROR"]
        
        for i in range(min(limit, 50)):
            log_entry = {
                "timestamp": (datetime.utcnow() - timedelta(minutes=i * 5)).isoformat(),
                "level": levels[i % len(levels)],
                "message": f"Mock log entry {i + 1}",
                "module": "system",
                "details": f"This is a sample log entry for testing purposes"
            }
            mock_logs.append(log_entry)
        
        return {
            "logs": mock_logs,
            "total": len(mock_logs),
            "filter": {
                "level": level,
                "limit": limit
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting system logs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching logs: {str(e)}")

@router.post("/track-request")
def track_request(error: bool = False):
    """Track API request for monitoring purposes"""
    global request_count, error_count
    
    request_count += 1
    if error:
        error_count += 1
    
    return {"message": "Request tracked"}

@router.get("/alerts")
def get_system_alerts(authorization: str | None = Header(None)):
    """Get current system alerts and warnings - Admin only"""
    user = get_current_user_from_auth_header(authorization)
    
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        alerts = []
        
        # Check system resources
        memory = psutil.virtual_memory()
        cpu_usage = psutil.cpu_percent()
        
        if memory.percent > 80:
            alerts.append({
                "id": "memory_high",
                "type": "warning" if memory.percent < 90 else "critical",
                "title": "High Memory Usage",
                "message": f"Memory usage is at {memory.percent:.1f}%",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        if cpu_usage > 80:
            alerts.append({
                "id": "cpu_high",
                "type": "warning" if cpu_usage < 90 else "critical",
                "title": "High CPU Usage",
                "message": f"CPU usage is at {cpu_usage:.1f}%",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        error_rate = (error_count / max(request_count, 1)) * 100
        if error_rate > 5:
            alerts.append({
                "id": "error_rate_high",
                "type": "warning" if error_rate < 10 else "critical",
                "title": "High Error Rate",
                "message": f"Error rate is at {error_rate:.1f}%",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        return {
            "alerts": alerts,
            "total": len(alerts),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")