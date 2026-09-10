import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Immersive, portrait-only — it's a phone game.
  SystemChrome.setPreferredOrientations(
      [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFF0A3D25),
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(const NeuroQuestApp());
}

class NeuroQuestApp extends StatelessWidget {
  const NeuroQuestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'NeuroQuest',
      debugShowCheckedModeBanner: false,
      home: GameShell(),
    );
  }
}

class GameShell extends StatefulWidget {
  const GameShell({super.key});

  @override
  State<GameShell> createState() => _GameShellState();
}

class _GameShellState extends State<GameShell> {
  late final WebViewController _controller;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF071710))
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) => setState(() => _ready = true),
      ))
      // The whole game ships inside the app — no server, works offline.
      ..loadFlutterAsset('assets/web/index.html');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF071710),
      body: SafeArea(
        child: Stack(children: [
          WebViewWidget(controller: _controller),
          if (!_ready)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFFE9B94F)),
            ),
        ]),
      ),
    );
  }
}
