from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from tickets.views import (
    TicketViewSet, SubTaskViewSet, CommentViewSet, AttachmentViewSet, AuditLogViewSet,
    LeaveRequestViewSet, AttendanceSessionViewSet, TicketTypeViewSet, CategoryViewSet, SubcategoryViewSet,
    EnvironmentViewSet
)
from users.views import RegisterView, UserDetailView, MyTokenObtainPairView, UserViewSet, SeedTestUsersView, ChangePasswordView
from projects.views import ProjectViewSet, ProjectMemberViewSet
from teams.views import TeamViewSet, TeamMemberViewSet
from notifications.views import NotificationViewSet

router = DefaultRouter()
router.register(r'tickets', TicketViewSet)
router.register(r'subtasks', SubTaskViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'project-members', ProjectMemberViewSet)
router.register(r'attachments', AttachmentViewSet)
router.register(r'audit-logs', AuditLogViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'attendance-sessions', AttendanceSessionViewSet)
router.register(r'ticket-types', TicketTypeViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'subcategories', SubcategoryViewSet)
router.register(r'environments', EnvironmentViewSet)

urlpatterns = [
    path('', RedirectView.as_view(url='api/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserDetailView.as_view(), name='user_detail'),
    path('api/auth/seed-test-users/', SeedTestUsersView.as_view(), name='seed_test_users'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
]
