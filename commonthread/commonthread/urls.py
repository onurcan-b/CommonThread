"""
URL configuration for commonthread project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))

Refs:
- https://learndjango.com/tutorials/django-login-and-logout-tutorial
"""

#from django.contrib import admin
from django.urls import path
# from ct_application.views import (
#     home_test,
#     login,
#     check_ml_status,
#     get_new_access_token,
#     create_user,
#     get_user,
#     edit_user,
#     delete_user,
#     create_org,
#     get_org,
#     edit_org,
#     delete_org,
#     add_user_to_org,
#     delete_user_from_org,
#     create_project,
#     get_project,
#     edit_project,
#     delete_project,
#     create_story,
#     edit_story,
#     delete_story,
#     get_stories,
#     get_story
# )
from ct_application import views as ct_views


urlpatterns = [
    path("", ct_views.home_test, name="home"),  # GET /
    path("login", ct_views.login, name="login"),
    path("create_access", ct_views.get_new_access_token, name="access-create"),
    path("story/<int:story_id>/ml-status", ct_views.check_ml_status, name="check-ml-status"),

    #User Related Endpoints
    path("user/create", ct_views.create_user, name="user-create"),
    path("user/<int:user_id>/edit", ct_views.edit_user, name="user-edit"),
    path("user/<int:user_id>/delete", ct_views.delete_user, name="user-delete"),
    path("user/", ct_views.get_user, name="get_user"),

    #Org Related Endpoints
    path("org/create", ct_views.create_org, name="org-create"),
    path("org/<int:org_id>", ct_views.get_org, name="get-org"),
    path("org/<int:org_id>/edit", ct_views.edit_org, name="org-edit"),
    path("org/<int:org_id>/delete", ct_views.delete_org, name="org-delete"),
    path("org/<int:org_id>/add-user/<int:add_user_id>", ct_views.add_user_to_org, name="add-user-to-org"),
    path(
        "org/<int:org_id>/delete-user/<int:del_user_id>", 
         ct_views.delete_user_from_org, 
         name="delete-user-from-org"),

    #Project Related Endpoints
    path("project/create", ct_views.create_project, name="project-create"),
    path("project/<int:project_id>", ct_views.get_project, name="get-project"),
    path("project/<int:org_id>/<int:project_id>/edit", ct_views.edit_project, name="project-edit"),
    path("project/<int:org_id>/<int:project_id>/delete", ct_views.delete_project, name="project-delete"),
    
    #Story Related Endpoints
    path("story/create", ct_views.create_story, name="story-create"),
    path("story/<int:story_id>/edit", ct_views.edit_story, name="story-edit"),
    path("story/<int:story_id>/delete", ct_views.delete_story, name="story-delete"),
    path("stories/", ct_views.get_stories, name="get_stories"),
    path("story/<int:story_id>", ct_views.get_story, name="get_story"),
    path('api/story/<int:story_id>/insights/', ct_views.story_insights_api, name='story_insights_api'),
]
