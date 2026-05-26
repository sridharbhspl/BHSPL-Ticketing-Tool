from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email) # Mirror email to username for stability
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Admin', 'System Admin'),
        ('Project Manager', 'Project Manager'),
        ('Developer', 'Developer'),
        ('Frontend Developer', 'Frontend Developer'),
        ('Backend Developer', 'Backend Developer'),
        ('Fullstack Developer', 'Fullstack Developer'),
        ('Senior Developer', 'Senior Developer'),
        ('Junior Developer', 'Junior Developer'),
        ('Senior Tester', 'Senior QA Engineer'),
        ('Junior Tester', 'Junior QA Engineer'),
        ('QA Tester', 'QA Automation Engineer'),
        ('Client', 'Client / Stakeholder'),
        ('Viewer', 'Executive Viewer / Stakeholder'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=255, choices=ROLE_CHOICES, default='Developer')
    avatar = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=255)
    
    objects = UserManager()
    
    REQUIRED_FIELDS = ['name', 'role']
    USERNAME_FIELD = 'email'
    
    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
