import React from 'react';
import { Thermometer } from 'lucide-react';

// Mock data - in a real app, this would come from your API
const mockData = {
  currentProgress: 67, // 67% of goal
  goalAmount: 1000000, // $1M goal
  currentAmount: 670000, // $670K achieved
  teamSize: 25,
};

const ThermometerDashboard = () => {
  const { currentProgress, goalAmount, currentAmount, teamSize } = mockData;
  
  // Calculate reward tier
  const getRewardTier = (progress: number) => {
    if (progress >= 100) return { percentage: 4, tier: 'CHAMPION', color: 'text-green-400' };
    if (progress >= 70) return { percentage: 3, tier: 'ELITE', color: 'text-orange-400' };
    if (progress >= 50) return { percentage: 2, tier: 'RISING', color: 'text-cyan-400' };
    return { percentage: 1, tier: 'BUILDING', color: 'text-red-400' };
  };

  const currentTier = getRewardTier(currentProgress);
  const nextTier = currentProgress < 100 ? getRewardTier(Math.min(currentProgress + 1, 100)) : null;
  
  // Calculate individual reward
  const totalReward = (currentAmount * currentTier.percentage) / 100;
  const individualReward = totalReward / teamSize;

  // Get thermometer fill color based on current tier
  const getThermometerColor = (progress: number) => {
    if (progress >= 100) return '#10B981'; // Green
    if (progress >= 70) return '#F59E0B'; // Orange  
    if (progress >= 50) return '#06B6D4'; // Cyan
    return '#EF4444'; // Red
  };

  // Define stage markers with colors matching the inspiration
  const stageMarkers = [
    { percentage: 25, label: '> 50%', color: '#EF4444', reward: '0.1%' },
    { percentage: 50, label: '50%', color: '#F59E0B', reward: '0.2%' },
    { percentage: 70, label: '70%', color: '#06B6D4', reward: '0.5%' },
    { percentage: 100, label: '100%', color: '#10B981', reward: '0.9%' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Commercial Team Goal Tracker
          </h1>
          <p className="text-gray-400 text-lg">
            Acompanhe o progresso e desbloqueie recompensas juntos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Thermometer Section */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Termômetro de Progresso</h2>
              <p className="text-gray-400">
                ${currentAmount.toLocaleString()} de ${goalAmount.toLocaleString()}
              </p>
            </div>

            {/* Thermometer Visual */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Thermometer Base */}
                <div className="w-16 h-96 bg-gray-700 rounded-full relative overflow-hidden border-2 border-gray-600">
                  {/* Stage Background Sections */}
                  <div className="absolute bottom-0 w-full h-1/4 bg-red-900/20"></div>
                  <div className="absolute bottom-1/4 w-full h-1/4 bg-orange-900/20"></div>
                  <div className="absolute bottom-2/4 w-full h-1/5 bg-cyan-900/20"></div>
                  <div className="absolute bottom-3/4 w-full h-1/4 bg-green-900/20"></div>
                  
                  {/* Progress Fill */}
                  <div 
                    className="absolute bottom-0 w-full transition-all duration-1000 ease-out rounded-full"
                    style={{ 
                      height: `${currentProgress}%`,
                      background: `linear-gradient(to top, ${getThermometerColor(currentProgress)}, transparent)`
                    }}
                  >
                    <div className="absolute inset-0 animate-pulse opacity-50 bg-gradient-to-t from-white/20 to-transparent"></div>
                  </div>
                  
                  {/* Stage Indicators Inside Thermometer */}
                  {stageMarkers.map((stage, index) => (
                    <div
                      key={stage.percentage}
                      className="absolute left-0 w-full"
                      style={{ bottom: `${stage.percentage}%` }}
                    >
                      {/* Stage line */}
                      <div className="w-full h-0.5 bg-white/40"></div>
                      
                      {/* Current stage highlight */}
                      {currentProgress >= (index === 0 ? 0 : stageMarkers[index-1]?.percentage || 0) && 
                       currentProgress < stage.percentage && (
                        <div 
                          className="absolute -left-1 -top-3 w-18 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-pulse"
                          style={{ backgroundColor: stage.color }}
                        >
                          ATUAL
                        </div>
                      )}
                      
                      {/* Percentage labels */}
                      <span 
                        className="absolute -right-16 -top-2 text-sm font-semibold"
                        style={{ color: stage.color }}
                      >
                        {stage.label}
                      </span>
                      
                      {/* Reward labels */}
                      <span 
                        className="absolute -right-24 top-2 text-xs"
                        style={{ color: stage.color }}
                      >
                        {stage.reward}
                      </span>
                    </div>
                  ))}
                  
                  {/* Achievement indicator for completed stages */}
                  {currentProgress >= 100 && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-2xl">🏆</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thermometer Bulb */}
                <div 
                  className="w-20 h-20 rounded-full absolute -bottom-2 -left-2 flex items-center justify-center border-2 border-white/20"
                  style={{ backgroundColor: getThermometerColor(currentProgress) }}
                >
                  <Thermometer className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Current Progress */}
            <div className="text-center">
              <div 
                className="text-5xl font-bold mb-2 bg-clip-text text-transparent"
                style={{ 
                  background: `linear-gradient(to right, ${getThermometerColor(currentProgress)}, ${getThermometerColor(currentProgress)}80)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                {currentProgress}%
              </div>
              <p className="text-gray-400">da meta alcançada</p>
              <div className={`text-lg font-semibold mt-2 ${currentTier.color}`}>
                Estágio Atual: {currentTier.tier}
              </div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="space-y-6">
            {/* Current Tier */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-center">Estágio Atual</h3>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${currentTier.color}`}>
                  {currentTier.tier}
                </div>
                <div className="text-2xl font-semibold mb-2">
                  {currentTier.percentage}% de Distribuição
                </div>
                <div className="text-gray-400 mb-4">
                  Pote Total: ${totalReward.toLocaleString()}
                </div>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                  Sua Parte: ${individualReward.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Next Tier */}
            {nextTier && (
              <div className="bg-gray-800 rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-semibold mb-4 text-center text-blue-400">
                  Próximo Estágio
                </h3>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 text-blue-400">
                    {nextTier.tier}
                  </div>
                  <div className="text-xl font-semibold mb-2">
                    {nextTier.percentage}% de Distribuição
                  </div>
                  <div className="text-gray-400 mb-4">
                    Necessário: {currentProgress >= 70 ? '100%' : currentProgress >= 50 ? '70%' : '50%'} para desbloquear
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold opacity-75">
                    Potencial: ${((goalAmount * nextTier.percentage) / 100 / teamSize).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Tier Breakdown */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-center">Estágios de Recompensa</h3>
              <div className="space-y-3">
                {[
                  { range: '0-49%', percentage: 1, color: 'text-red-400', bgColor: 'bg-red-900/20' },
                  { range: '50-69%', percentage: 2, color: 'text-orange-400', bgColor: 'bg-orange-900/20' },
                  { range: '70-99%', percentage: 3, color: 'text-cyan-400', bgColor: 'bg-cyan-900/20' },
                  { range: '100%+', percentage: 4, color: 'text-green-400', bgColor: 'bg-green-900/20' },
                ].map((tier, index) => {
                  const isCurrentTier = 
                    (index === 0 && currentProgress < 50) ||
                    (index === 1 && currentProgress >= 50 && currentProgress < 70) ||
                    (index === 2 && currentProgress >= 70 && currentProgress < 100) ||
                    (index === 3 && currentProgress >= 100);
                  
                  return (
                    <div 
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-lg border-2 ${
                        isCurrentTier 
                          ? `${tier.bgColor} border-current ${tier.color}` 
                          : 'bg-gray-800/50 border-transparent'
                      }`}
                    >
                      <span className={tier.color}>{tier.range}</span>
                      <span className={`${tier.color} font-semibold`}>
                        {tier.percentage}% da receita
                      </span>
                      {isCurrentTier && (
                        <span className={`${tier.color} text-xs font-bold animate-pulse`}>
                          ATUAL
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {teamSize}
              </div>
              <div className="text-gray-400">Membros da Equipe</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                ${(goalAmount - currentAmount).toLocaleString()}
              </div>
              <div className="text-gray-400">Restante para a Meta</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                ${(goalAmount * 0.04 / teamSize).toLocaleString()}
              </div>
              <div className="text-gray-400">Potencial Máximo por Pessoa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermometerDashboard;