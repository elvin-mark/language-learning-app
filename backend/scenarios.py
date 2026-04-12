from typing import List, Dict, Optional
from pydantic import BaseModel


class Scenario(BaseModel):
    id: str
    name: str
    description: str
    role: str
    goal: str
    objectives: List[str]
    initial_message: str
    difficulty: str = "Beginner"


SCENARIOS = {
    "cafe-seoul": Scenario(
        id="cafe-seoul",
        name="Coffee in Seoul",
        description="Order a drink and a snack at a busy Hongdae cafe.",
        role="Friendly Barista in Hongdae",
        goal="Get your caffeine fix and a small treat in Korean.",
        objectives=[
            "Order an Iced Americano (아이스 아메리카노)",
            "Ask for less ice (얼음 적게 주세요)",
            "Add a chocolate muffin (초코 머핀)",
            "Pay with a card (카드로 계산할게요)",
        ],
        initial_message="어서오세요! 주문 도와드릴까요? (Welcome! Can I take your order?)",
        difficulty="Beginner",
    ),
    "hotel-check-in": Scenario(
        id="hotel-check-in",
        name="Hotel Check-in",
        description="Check into your hotel and ask about the breakfast/WiFi.",
        role="Professional Receptionist",
        goal="Successfully check-in and get the WiFi info.",
        objectives=[
            "Say you have a reservation",
            "Give your name",
            "Ask what time breakfast is",
            "Ask for the WiFi password",
        ],
        initial_message="안녕하세요, 린기스 호텔입니다. 예약하셨나요?",
        difficulty="Intermediate",
    ),
    "market-haggling": Scenario(
        id="market-haggling",
        name="Market Haggling",
        description="Try to get a better price for a souvenir at a traditional market.",
        role="Tough but fair Market Vendor",
        goal="Buy the souvenir for a lower price.",
        objectives=[
            "Ask for the price",
            "Say it's too expensive",
            "Suggest a lower price",
            "Agree on a final price",
        ],
        initial_message="이거 진짜 좋은 거예요! 한번 구경해보세요.",
        difficulty="Intermediate",
    ),
}


def get_scenario(scenario_id: str) -> Optional[Scenario]:
    return SCENARIOS.get(scenario_id)


def get_all_scenarios() -> List[Scenario]:
    return list(SCENARIOS.values())
