import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RewardRedeemModalComponent } from '../reward-redeem-modal/reward-redeem-modal.component';
import { Achievement } from 'src/app/services/recompensas.service';

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  imageUrl: string;
  category: string;
  amount: number;
  isHighlighted?: boolean;
  isLimited?: boolean;
  owned?: number;
  redeemedAt?: string;
  userEmail?: string;
  requires: {
    item: string;
  }[];
}

export interface PlayerRedeemLog {
  id: string; // ID do resgate
  itemName: string;
  imageUrl: string;
  redeemedAt: string; // ISO string
  price: number;
  currency: string;
  quantity: number;
  category: string;
  requires: {
    item: string;
  }[];
}

const MOCK_PLAYER_REDEEM_LOGS: PlayerRedeemLog[] = [
  {
    id: '8afh20',
    itemName: 'Café Premium',
    imageUrl: '',
    redeemedAt: '2024-01-15T10:30:00',
    price: 100,
    currency: 'Aplausos',
    quantity: 1,
    category: 'Bebidas',
    requires: [{
      item: 'points',
    }]
  },
  {
    id: '8afh21',
    itemName: 'Camiseta Personalizada',
    imageUrl: '',
    redeemedAt: '2024-01-14T15:45:00',
    price: 250,
    currency: 'Aplausos',
    quantity: 1,
    category: 'Vestuário',
    requires: [{
      item: 'points',
    }]
  },
  {
    id: '8afh22',
    itemName: 'Vale Presente',
    imageUrl: '',
    redeemedAt: '2024-01-13T09:20:00',
    price: 500,
    currency: 'Moedas',
    quantity: 2,
    category: 'Presentes',
    requires: [{
      item: 'coins',
    }]
  }
];

@Component({
  selector: 'app-rewards-store',
  templateUrl: './rewards-store.component.html',
  styleUrls: ['./rewards-store.component.scss']
})
export class RewardsStoreComponent implements OnInit, OnChanges {
  @Input() rewards: Reward[] = [];
  @Input() categories: string[] = [];
  @Input() isLoading: boolean = false;
  @Output() rewardRedeemed = new EventEmitter<void>();
  @Input() playerRedeemLogs: PlayerRedeemLog[] = [];

  selectedCategory: string = 'all';
  searchTerm: string = '';
  filteredRewards: Reward[] = [];
  activeTab: 'store' | 'my-rewards' = 'store';
  myRedeemedRewards: Reward[] = [];
  isLoadingInternal: boolean = true;
  playerRedeemCards: PlayerRedeemLog[] = [];

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    this.selectedCategory = 'all';
    this.loadRedeemedRewards();
    this.filterRewards();
    // A chamada real da API deve ser feita pelo componente pai futuramente
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rewards']) {
      this.isLoadingInternal = true;
      this.filterRewards();
      // Simula um pequeno delay para mostrar o shimmer
      setTimeout(() => {
        if (this.rewards && this.rewards.length > 0) {
          this.isLoadingInternal = false;
        }
      }, 800);
    }
    if (changes['categories']) {
      this.filterRewards();
    }
  }

  loadRedeemedRewards() {
    const redeemedRewards = localStorage.getItem('redeemed_rewards');
    if (redeemedRewards) {
      const parsedRewards = JSON.parse(redeemedRewards);
      this.myRedeemedRewards = parsedRewards.map((reward: any) => ({
        id: reward.id,
        title: reward.title,
        description: reward.description,
        cost: reward.cost,
        imageUrl: reward.imageUrl,
        category: reward.category || 'default',
        amount: reward.amount || 0,
        isHighlighted: reward.isHighlighted,
        isLimited: reward.isLimited,
        owned: reward.owned || 0,
        redeemedAt: reward.redeemedAt,
        userEmail: reward.userEmail
      }));
    }
  }

  loadPlayerRedeemLogs() {
    // A chamada real da API deve ser feita pelo componente pai e os dados passados por @Input futuramente
    // Exemplo de uso:
    // this.playerRedeemCards = this.mapAchievementsToCards(achievements, this.rewards);
  }

  mapAchievementsToCards(achievements: Achievement[], items: Reward[]): PlayerRedeemLog[] {
    return achievements.map(ach => {
      const item = items.find(i => i.id === ach.item);
      return {
        id: ach._id.slice(0, 6),
        itemName: item?.title || 'Desconhecido',
        imageUrl: item?.imageUrl || '',
        redeemedAt: new Date(ach.time).toISOString(),
        price: item?.cost || 0,
        currency: item?.requires?.[0]?.item || '',
        quantity: ach.total,
        category: item?.category || '',
        requires: item?.requires || []
      };
    });
  }

  onTabChange(tab: 'store' | 'my-rewards') {
    this.activeTab = tab;
    if (tab === 'my-rewards') {
      this.loadRedeemedRewards();
      this.filterRewards();
    } else {
      this.filterRewards();
    }
  }

  onCategorySelect(category: string) {
    this.selectedCategory = category;
    this.filterRewards();
  }

  onSearch() {
    this.filterRewards();
  }

  filterRewards() {
    const rewardsToFilter = this.activeTab === 'store' ? this.rewards : this.myRedeemedRewards;
    
    this.filteredRewards = rewardsToFilter.filter(reward => {
      const matchesCategory = this.selectedCategory === 'all' || reward.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        reward.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      
      return matchesCategory && matchesSearch;
    });
    
  }

  onRewardRedeem(reward: Reward) {
    const modalRef = this.modalService.open(RewardRedeemModalComponent, { size: 'md', centered: true });
    modalRef.componentInstance.reward = reward;
    
    modalRef.result.then((result) => {
      if (result === 'redeemed') {
        this.loadRedeemedRewards();
        if (this.activeTab === 'my-rewards') {
          this.filterRewards();
        }
        this.rewardRedeemed.emit();
      }
    });
  }

  getPlayerRedeemLogs(): PlayerRedeemLog[] {
    return this.playerRedeemLogs;
  }
} 