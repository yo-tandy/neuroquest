import 'package:flutter_test/flutter_test.dart';
import 'package:neuroquest/main.dart';

void main() {
  testWidgets('app builds', (WidgetTester tester) async {
    await tester.pumpWidget(const NeuroQuestApp());
    expect(find.byType(GameShell), findsOneWidget);
  });
}
