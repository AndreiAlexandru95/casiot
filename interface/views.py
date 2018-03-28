from django.views.generic import TemplateView

# Create your views here.
class HomeView(TemplateView):
	template_name = 'home.html'

class DashboardListView(TemplateView):
	template_name = 'dashboard/dashboard.html'