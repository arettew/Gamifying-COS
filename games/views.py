from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from django.views.generic import TemplateView

class HomeView(TemplateView):
    template_name = "homepage.html"

class ArraysView(TemplateView): 
    template_name = "arrays.html"

class ConditionalsView(TemplateView): 
    template_name = "conditionals.html"

class LoopsViewOne(TemplateView):
    template_name = "level1.html"

class LoopsViewTwo(TemplateView):
    template_name = "level2.html"